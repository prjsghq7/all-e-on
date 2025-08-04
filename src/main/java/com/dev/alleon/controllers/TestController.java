package com.dev.alleon.controllers;

import com.dev.alleon.services.OpenAiService;
import com.dev.alleon.services.TestDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("/test")
public class TestController {

    private final OpenAiService openAiService;
    private final TestDataService testDataService;

    // 1. 페이지 렌더링
    @GetMapping
    public String getTestPage(@RequestParam(value = "kw", required = false) String kw, Model model) {
        model.addAttribute("kw", kw); // ✅ 무조건 넣어야 thymeleaf에서 isEmpty 판단됨

        if (kw != null && !kw.isBlank()) {
            var items = testDataService.fetchByKeyword(kw);
            var summary = openAiService.summarizeResults(items);
            model.addAttribute("items", items);
            model.addAttribute("summary", summary);
        }
        return "test/test";
    }

    // 2. 음성 → 키워드 추출 → redirect 주소 JSON 응답
    @PostMapping("/welfare/voice")
    @ResponseBody
    public Map<String, Object> voiceSearch(@RequestBody Map<String, String> body) {
        String transcript = body.getOrDefault("transcript", "");
        String kw = openAiService.extractKeyword(transcript);
        try {
            String redirectTo = "/test?kw=" + URLEncoder.encode(kw, "UTF-8");
            return Map.of("redirectTo", redirectTo);
        } catch (Exception e) {
            return Map.of("redirectTo", "/test");
        }
    }

    // 3. JSON API 테스트용 (선택)
    @GetMapping("/json")
    @ResponseBody
    public Map<String, Object> jsonSearch(@RequestParam String kw) {
        var items = testDataService.fetchByKeyword(kw);
        var summary = openAiService.summarizeResults(items);
        return Map.of("kw", kw, "summary", summary, "items", items);
    }

    @GetMapping("/button")
    public String getButton(){
        return "/test/buttontest";
    }
}
