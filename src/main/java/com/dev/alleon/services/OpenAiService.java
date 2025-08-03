package com.dev.alleon.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class OpenAiService {

    private final WebClient client;
    private final String model;
    private final ObjectMapper om = new ObjectMapper();

    public OpenAiService(@Value("${openai.api-url}") String apiUrl,
                         @Value("${openai.api-key}") String apiKey,
                         @Value("${openai.model}") String model) {
        this.model = model;
        this.client = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    /** 음성 문장에서 검색에 쓸 핵심 키워드만 뽑아옴 (코드 매핑 없음) */
    public String extractKeyword(String transcript) {
        String system = """
            너는 한국어 질의에서 '검색어'만 뽑아내는 도우미다.
            코드/분류는 금지. 핵심 명사 구절만 반환해라.
            출력은 JSON 하나만: {"keywords":"..."} 다른 텍스트 금지.
            예) "노인 관련 복지 서비스 알려줘" -> {"keywords":"노인복지"}
            예) "임산부 지원금" -> {"keywords":"임산부지원금"}
            """;

        Map<String,Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role","system","content", system),
                        Map.of("role","user","content", transcript)
                ),
                "temperature", 0
        );

        Map resp = client.post()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        try {
            String content = (String)((Map)((Map)((List)resp.get("choices")).get(0)).get("message")).get("content");
            return om.readTree(content).path("keywords").asText("");
        } catch (Exception e) {
            throw new RuntimeException("키워드 추출 실패: " + e.getMessage());
        }
    }

    /** 결과 목록을 한국어 한 단락으로 요약(최대 3건 구체화) */
    public String summarizeResults(List<Map<String,Object>> items) {
        StringBuilder sb = new StringBuilder();
        sb.append("[입력]\n");
        int limit = Math.min(5, items.size());
        for (int i = 0; i < limit; i++) {
            var it = items.get(i);
            sb.append(i+1).append(". ")
                    .append(String.valueOf(it.getOrDefault("servNm","")))
                    .append(" — ")
                    .append(String.valueOf(it.getOrDefault("servDgst","")))
                    .append("\n");
        }
        String user = """
            위 [입력]을 기준으로 다음 규칙으로 한국어 한 단락을 생성해.
            형식: "검색결과 총 X건이 검색되었습니다. 첫번째로 ~~, 두번째로 ~~, 세번째로 ~~ ..."
             구체적으로 말하고 불필요한 존칭/군더더기 금지.
            """;

        Map<String,Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role","system","content", "너는 간결한 한국어 안내 음성 문구를 작성한다."),
                        Map.of("role","user","content", sb.toString() + "\n\n" + user)
                ),
                "temperature", 0.2
        );

        Map resp = client.post()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        try {
            return ((String)((Map)((Map)((List)resp.get("choices")).get(0)).get("message")).get("content")).trim();
        } catch (Exception e) {
            throw new RuntimeException("요약 생성 실패: " + e.getMessage());
        }
    }
}
