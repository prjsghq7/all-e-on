package com.dev.alleon.services;

import com.dev.alleon.dtos.welfare.WelfareListDto;
import com.dev.alleon.dtos.welfare.WelfareListResponse;
import com.dev.alleon.entities.CodeEntity;
import com.dev.alleon.mappers.welfare.HouseholdTypeMapper;
import com.dev.alleon.mappers.welfare.InterestSubMapper;
import com.dev.alleon.mappers.welfare.LifeCycleMapper;
import com.dev.alleon.vos.PageVo;
import com.dev.alleon.vos.WelfareSearchVo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class WelfareService {
    private static final String API_URL = "https://apis.data.go.kr/B554287/NationalWelfareInformationsV001";
    private static final String LIST_QUERY = "/NationalWelfarelistV001";
    private static final String DETAIL_QUERY = "/NationalWelfaredetailedV001";
    private static final int NUMBER_OF_ROWS = 10;

    @Value("${welfare.service-key}")
    private String serviceKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private final LifeCycleMapper lifeCycleMapper;
    private final HouseholdTypeMapper householdTypeMapper;
    private final InterestSubMapper interestSubMapper;

    public WelfareService(LifeCycleMapper lifeCycleMapper, HouseholdTypeMapper householdTypeMapper, InterestSubMapper interestSubMapper) {
        this.lifeCycleMapper = lifeCycleMapper;
        this.householdTypeMapper = householdTypeMapper;
        this.interestSubMapper = interestSubMapper;
    }

    public List<CodeEntity> getWelfareSearchCodes(WelfareSearchVo.SearchType searchType) {
        List<CodeEntity> codeEntities;
        switch (searchType) {
            case lifeArray:
                codeEntities = this.lifeCycleMapper.selectAll();
                break;
            case trgterIndvdlArray:
                codeEntities = this.householdTypeMapper.selectAll();
                break;
            case IntrsThemaArray:
                codeEntities = this.interestSubMapper.selectAll();
                break;
            default:
                codeEntities = null;
        }
        return codeEntities;
    }

    public WelfareListResponse getWelfareList(WelfareSearchVo welfareSearchVo, int page) {
        if (page <= 0) {
            page = 1;
        }

        System.out.println("serviceKey: " + serviceKey);
        String encodedServiceKey = URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);
        String encodeKeyword = welfareSearchVo.getKeyword() != null
                ? URLEncoder.encode(welfareSearchVo.getKeyword(), StandardCharsets.UTF_8)
                : "";
        URI requestUrl = UriComponentsBuilder.fromHttpUrl(API_URL + LIST_QUERY)
                .queryParam("serviceKey", encodedServiceKey)
                .queryParam("pageNo", page)
                .queryParam("numOfRows", NUMBER_OF_ROWS)
                .queryParam("callTp", "D")
                .queryParam("srchKeyCode", welfareSearchVo.getSearchKeyCode())
                .queryParam("searchWrd", encodeKeyword)
                .queryParam(welfareSearchVo.getSearchType().toString(), welfareSearchVo.getCode())
                .build(true)
                .toUri();

        System.out.println("requestUrl : " + requestUrl);

        String xmlResponse = restTemplate.getForObject(requestUrl, String.class);
        System.out.println(xmlResponse);

        return parseXmlToWelfareResponse(xmlResponse, page);
    }

    private WelfareListResponse parseXmlToWelfareResponse(String xmlResponse, int page) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xmlResponse)));

            Node totalCountNode = doc.getElementsByTagName("totalCount").item(0);
            int totalCount = totalCountNode != null
                    ? Integer.parseInt(totalCountNode.getTextContent())
                    : 0;

            PageVo pageVo = new PageVo(NUMBER_OF_ROWS, page, totalCount);


            NodeList nodes = doc.getElementsByTagName("servList");
            List<WelfareListDto> welfareList = new ArrayList<>();

            for (int i = 0; i < nodes.getLength(); i++) {
                Element el = (Element) nodes.item(i);
                WelfareListDto dto = new WelfareListDto();

                dto.setInqNum(Integer.parseInt(getTagValue(el, "inqNum")));
                dto.setIntrsThemaArray(getTagValue(el, "intrsThemaArray"));
                dto.setJurMnofNm(getTagValue(el, "jurMnofNm"));
                dto.setJurOrgNm(getTagValue(el, "jurOrgNm"));
                dto.setLifeArray(getTagValue(el, "lifeArray"));
                dto.setOnapPsbltYn(getTagValue(el, "onapPsbltYn"));
                dto.setRprsCtadr(getTagValue(el, "rprsCtadr"));
                dto.setServDgst(getTagValue(el, "servDgst"));
                dto.setServDtlLink(getTagValue(el, "servDtlLink"));
                dto.setServId(getTagValue(el, "servId"));
                dto.setServNm(getTagValue(el, "servNm"));
                dto.setSprtCycNm(getTagValue(el, "sprtCycNm"));
                dto.setSrvPvsnNm(getTagValue(el, "srvPvsnNm"));
                dto.setSvcfrstRegTs(
                        LocalDate.parse(
                                getTagValue(el, "svcfrstRegTs"),
                                DateTimeFormatter.ofPattern("yyyyMMdd")
                        )
                );
                dto.setTrgterIndvdlArray(getTagValue(el, "trgterIndvdlArray"));
                welfareList.add(dto);
            }
            return new WelfareListResponse(welfareList, pageVo);
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new RuntimeException(e);
        }
    }


    private String getTagValue(Element parent, String tag) {
        NodeList node = parent.getElementsByTagName(tag);
        if (node.getLength() == 0) return null;

        String value = node.item(0).getTextContent();
        return (value == null || value.isBlank()) ? null : value;
    }
}
