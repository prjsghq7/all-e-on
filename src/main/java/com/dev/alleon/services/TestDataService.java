package com.dev.alleon.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TestDataService {

    private final String baseUrl;
    private final String listPath;
    private final String serviceKey;
    private final WebClient web = WebClient.builder().build();

    public TestDataService(@Value("${welfare.base-url}") String baseUrl,
                           @Value("${welfare.list-path}") String listPath,
                           @Value("${welfare.service-key}") String serviceKey) {
        this.baseUrl = baseUrl;
        this.listPath = listPath;
        this.serviceKey = serviceKey;
    }

    public List<Map<String, Object>> fetchByKeyword(String keywords) {
        String kw = (keywords == null) ? "" : keywords.trim();


        String encodedKeyword = URLEncoder.encode(kw, StandardCharsets.UTF_8).replace("+", "%20");
        String encodedServiceKey = URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);

        String url = String.format(
                "%s%s?serviceKey=%s&callTp=L&pageNo=1&numOfRows=10&srchKeyCode=003&searchWrd=%s&orderBy=popular",
                baseUrl, listPath, encodedServiceKey, encodedKeyword);

        System.out.println("🔍 최종 요청 URL: " + url);

        String xml = web.get()
                .uri(URI.create(url))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        System.out.println("🧾 받아온 XML:\n" + xml);


        if (xml != null && xml.contains("<OpenAPI_ServiceResponse>")) {
            return List.of();
        }

        return parseList(xml);
    }


    private List<Map<String, Object>> parseList(String xml) {
        List<Map<String, Object>> out = new ArrayList<>();
        try {
            var factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            var doc = factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));

            NodeList listNodes = doc.getElementsByTagName("servList");
            System.out.println("servList 개수: " + listNodes.getLength());
            for (int i = 0; i < listNodes.getLength(); i++) {
                Element el = (Element) listNodes.item(i);
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("servId", getText(el, "servId"));
                m.put("servNm", getText(el, "servNm"));
                m.put("servDgst", getText(el, "servDgst"));
                m.put("jurMnofNm", getText(el, "jurMnofNm"));
                m.put("onapPsbltYn", getText(el, "onapPsbltYn"));
                m.put("srvPvsnNm", getText(el, "srvPvsnNm"));
                m.put("servDtlLink", getText(el, "servDtlLink"));
                out.add(m);
            }
        } catch (Exception e) {
            throw new RuntimeException("XML 파싱 실패: " + e.getMessage());
        }
        return out;
    }

    private String getText(Element parent, String tag) {
        NodeList nl = parent.getElementsByTagName(tag);
        return (nl.getLength() > 0) ? nl.item(0).getTextContent() : null;
    }
}
