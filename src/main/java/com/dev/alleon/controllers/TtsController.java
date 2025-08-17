package com.dev.alleon.controllers;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tts")
public class TtsController {

    @Value("${google.tts.apiKey}")
    private String apiKey;

    private final RestTemplate rest = new RestTemplate();

    @Data
    public static class TtsRequest {
        private String text;                 // 필수
        private String languageCode = "ko-KR";
        private String voiceName;            // 예: "ko-KR-Neural2-A"
        private Double speakingRate = 1.0;   // 0.25~4.0
        private Double pitch = 0.0;          // -20~20
        private String audioEncoding = "MP3";// MP3|OGG_OPUS|LINEAR16
        private Boolean useSsml = false;     // true면 text를 SSML로 해석
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> synthesize(@RequestBody TtsRequest req) {
        if (req == null || req.getText() == null || req.getText().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String url = "https://texttospeech.googleapis.com/v1/text:synthesize?key=" + apiKey;

        Map<String, Object> body = new HashMap<>();
        Map<String, Object> input = new HashMap<>();
        if (Boolean.TRUE.equals(req.getUseSsml())) input.put("ssml", req.getText());
        else input.put("text", req.getText());
        body.put("input", input);

        Map<String, Object> voice = new HashMap<>();
        voice.put("languageCode", req.getLanguageCode() == null ? "ko-KR" : req.getLanguageCode());
        if (req.getVoiceName() != null && !req.getVoiceName().isBlank()) {
            voice.put("name", req.getVoiceName());
        }
        body.put("voice", voice);

        Map<String, Object> audioConfig = new HashMap<>();
        String enc = req.getAudioEncoding() == null ? "MP3" : req.getAudioEncoding();
        audioConfig.put("audioEncoding", enc);
        if (req.getSpeakingRate() != null) audioConfig.put("speakingRate", req.getSpeakingRate());
        if (req.getPitch() != null)        audioConfig.put("pitch", req.getPitch());
        body.put("audioConfig", audioConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> res = rest.exchange(url, HttpMethod.POST, entity, Map.class);
            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
            }

            Object audioContent = res.getBody().get("audioContent");
            if (!(audioContent instanceof String s) || s.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
            }
            byte[] bytes = Base64.getDecoder().decode(s);

            String contentType = switch (enc) {
                case "OGG_OPUS" -> "audio/ogg";
                case "LINEAR16" -> "audio/wav"; // 실제는 PCM
                default -> "audio/mpeg";
            };
            String ext = contentType.equals("audio/ogg") ? "ogg"
                    : contentType.equals("audio/wav") ? "wav"
                    : "mp3";

            HttpHeaders out = new HttpHeaders();
            out.set(HttpHeaders.CONTENT_TYPE, contentType);
            out.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"tts." + ext + "\"");
            return ResponseEntity.ok().headers(out).body(bytes);

        } catch (HttpStatusCodeException e) {
            System.err.println("Google TTS error: " + e.getStatusCode() + " " + e.getResponseBodyAsString());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }
}
