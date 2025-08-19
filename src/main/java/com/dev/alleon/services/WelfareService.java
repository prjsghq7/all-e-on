package com.dev.alleon.services;

import com.dev.alleon.dtos.home.HomeRecommendDto;
import com.dev.alleon.dtos.welfare.*;
import com.dev.alleon.entities.CodeEntity;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.welfare.WelfareLikesEntity;
import com.dev.alleon.entities.welfare.*;
import com.dev.alleon.mappers.welfare.*;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.welfare.WelfareApiResult;
import com.dev.alleon.vos.PageVo;
import com.dev.alleon.vos.WelfareSearchVo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cglib.core.Local;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WelfareService {
    private static final String API_URL = "https://apis.data.go.kr/B554287/NationalWelfareInformationsV001";
    private static final String LIST_QUERY = "/NationalWelfarelistV001";
    private static final String DETAIL_QUERY = "/NationalWelfaredetailedV001";
    private static final int NUMBER_OF_ROWS = 10;
    private static final int RECOMMEND_OF_ROWS = 3;

    @Value("${welfare.service-key}")
    private String serviceKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private final LifeCycleMapper lifeCycleMapper;
    private final HouseholdTypeMapper householdTypeMapper;
    private final InterestSubMapper interestSubMapper;

    private final WelfareMapper welfareMapper;
    private final WelfareLikesMapper welfareLikesMapper;
    private final InstitutionMapper institutionMapper;
    private final InquiryContactMapper inquiryContactMapper;
    private final InquiryLinkMapper inquiryLinkMapper;
    private final FormMaterialMapper formMaterialMapper;
    private final BasisStatuteMapper basisStatuteMapper;

    public WelfareService(LifeCycleMapper lifeCycleMapper, HouseholdTypeMapper householdTypeMapper, InterestSubMapper interestSubMapper, WelfareMapper welfareMapper, WelfareLikesMapper welfareLikesMapper, InstitutionMapper institutionMapper, InquiryContactMapper inquiryContactMapper, InquiryLinkMapper inquiryLinkMapper, FormMaterialMapper formMaterialMapper, BasisStatuteMapper basisStatuteMapper) {
        this.lifeCycleMapper = lifeCycleMapper;
        this.householdTypeMapper = householdTypeMapper;
        this.interestSubMapper = interestSubMapper;

        this.welfareMapper = welfareMapper;
        this.welfareLikesMapper = welfareLikesMapper;
        this.institutionMapper = institutionMapper;
        this.inquiryContactMapper = inquiryContactMapper;
        this.inquiryLinkMapper = inquiryLinkMapper;
        this.formMaterialMapper = formMaterialMapper;
        this.basisStatuteMapper = basisStatuteMapper;
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
            case intrsThemaArray:
                codeEntities = this.interestSubMapper.selectAll();
                break;
            default:
                codeEntities = null;
        }
        return codeEntities;
    }

    public List<HomeRecommendDto> getHomeRecommendList(String code, String type) {
        if (code == null || type == null) {
            return null;
        }
        System.out.println("homeRecommend: " + serviceKey);
        String encodedServiceKey = URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);
        URI requestUrl = UriComponentsBuilder.fromHttpUrl(API_URL + LIST_QUERY)
                .queryParam("serviceKey", encodedServiceKey)
                .queryParam("pageNo", 1)
                .queryParam("numOfRows", RECOMMEND_OF_ROWS)
                .queryParam("callTp", "D")
                .queryParam("srchKeyCode", "003")
                .queryParam(type, code)
                .build(true)
                .toUri();
        System.out.println("requestUrl : " + requestUrl);
        String xmlResponse = restTemplate.getForObject(requestUrl, String.class);
        System.out.println(xmlResponse);
        System.out.println(parseXmlToHomeRecommend(xmlResponse));
        return parseXmlToHomeRecommend(xmlResponse);
    }

    public List<HomeRecommendDto> parseXmlToHomeRecommend(String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xmlResponse)));
            System.out.println("doc: " + doc);
            NodeList nodes = doc.getElementsByTagName("servList");
            System.out.println(nodes.getLength());

            List<HomeRecommendDto> homeRecommendDtos = new ArrayList<>();
            for (int i = 0; i < nodes.getLength(); i++) {
                Element el = (Element) nodes.item(i);
                System.out.println("el: " + el.getTextContent());
                HomeRecommendDto dto = new HomeRecommendDto();
                dto.setServId(getTagValue(el, "servId"));
                dto.setServNm(getTagValue(el, "servNm"));
                dto.setServDgst(getTagValue(el, "servDgst"));
                homeRecommendDtos.add(dto);
            }
            return homeRecommendDtos;
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new RuntimeException(e);
        }
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
                dto.setJurMnofNm(getTagValue(el, "jurMnofNm"));
                dto.setJurOrgNm(getTagValue(el, "jurOrgNm"));
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
                dto.setIntrsThemaArray(getTagListValue(el, "intrsThemaArray"));
                dto.setLifeArray(getTagListValue(el, "lifeArray"));
                dto.setTrgterIndvdlArray(getTagListValue(el, "trgterIndvdlArray"));
                welfareList.add(dto);
            }
            return new WelfareListResponse(welfareList, pageVo);
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    public WelfareDetailResponse getWelfareDetail(String id) {
        if (this.welfareMapper.selectCountById(id) < 1) {
            String encodedServiceKey = URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);
            URI requestUrl = UriComponentsBuilder.fromHttpUrl(API_URL + DETAIL_QUERY)
                    .queryParam("serviceKey", encodedServiceKey)
                    .queryParam("callTp", "D")
                    .queryParam("servId", id)
                    .build(true)
                    .toUri();

            System.out.println("requestUrl : " + requestUrl);

            String xmlResponse = restTemplate.getForObject(requestUrl, String.class);
            System.out.println("xmlResponse : " + xmlResponse);
            WelfareApiResult welfareApiResult = getWelfareApiResult(xmlResponse);
            System.out.println("welfareApiResult : " + welfareApiResult);
            if (welfareApiResult != WelfareApiResult.SUCCESS) {
                return null;
            }

            WelfareDetailDto welfareDetail = this.parseXmlToWelfareDetail(xmlResponse);

            this.welfareMapper.insert(welfareDetail.getWelfare());
            for (InstitutionEntity institution : welfareDetail.getInstitutions()) {
                this.institutionMapper.insert(institution);
            }
            for (InquiryContactEntity inquiryContact : welfareDetail.getInquiryContacts()) {
                this.inquiryContactMapper.insert(inquiryContact);
            }
            for (InquiryLinkEntity inquiryLink : welfareDetail.getInquiryLinks()) {
                this.inquiryLinkMapper.insert(inquiryLink);
            }
            for (FormMaterialEntity formMaterial : welfareDetail.getFormMaterials()) {
                this.formMaterialMapper.insert(formMaterial);
            }
            for (BasisStatuteEntity basisStatute : welfareDetail.getBasisStatutes()) {
                this.basisStatuteMapper.insert(basisStatute);
            }
        }

        WelfareDetailResponse welfareDetailResponse = new WelfareDetailResponse(this.welfareMapper.selectById(id));
        welfareDetailResponse.setInstitutions(this.institutionMapper.selectByWelfareId(id));
        welfareDetailResponse.setInquiryContacts(this.inquiryContactMapper.selectByWelfareId(id));
        welfareDetailResponse.setInquiryLinks(this.inquiryLinkMapper.selectByWelfareId(id));
        welfareDetailResponse.setFormMaterials(this.formMaterialMapper.selectByWelfareId(id));
        welfareDetailResponse.setBasisStatutes(this.basisStatuteMapper.selectByWelfareId(id));
        return welfareDetailResponse;
    }

    private WelfareDetailDto parseXmlToWelfareDetail(String xmlResponse) {
        System.out.println("xmlResponse : " + xmlResponse);

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xmlResponse)));

            Element rootElement = doc.getDocumentElement();
            System.out.println("rootElement : " + rootElement);

            WelfareEntity welfare = new WelfareEntity();

            welfare.setId(getTagValue(rootElement, "servId"));
            welfare.setName(getTagValue(rootElement, "servNm"));
            welfare.setMinistryName(getTagValue(rootElement, "jurMnofNm"));

            welfare.setTargetDetailContent(getTagValue(rootElement, "tgtrDtlCn"));
            welfare.setSelectionCriteriaContent(getTagValue(rootElement, "slctCritCn"));
            welfare.setAllowanceServiceContent(getTagValue(rootElement, "alwServCn"));

            welfare.setCriteriaYear(getTagValue(rootElement, "crtrYr"));
            welfare.setSummary(getTagValue(rootElement, "wlfareInfoOutlCn"));
            welfare.setSupportCycle(getTagValue(rootElement, "sprtCycNm"));
            welfare.setServiceProvision(getTagValue(rootElement, "srvPvsnNm"));

            welfare.setLifeArray(getTagValue(rootElement, "lifeArray"));
            welfare.setTrgterIndvdlArray(getTagValue(rootElement, "trgterIndvdlArray"));
            welfare.setIntrsThemaArray(getTagValue(rootElement, "intrsThemaArray"));

            welfare.setViews(0);

            NodeList institutionNodes = doc.getElementsByTagName("applmetList");
            List<InstitutionEntity> institutions = parseInstitutions(institutionNodes, welfare.getId());

            NodeList inquiryContactNodes = doc.getElementsByTagName("inqplCtadrList");
            List<InquiryContactEntity> inquiryContacts = parseInquiryContacts(inquiryContactNodes, welfare.getId());

            NodeList inquiryLinkNodes = doc.getElementsByTagName("inqplHmpgReldList");
            List<InquiryLinkEntity> inquiryLinks = parseInquiryLinks(inquiryLinkNodes, welfare.getId());

            NodeList formMaterialNodes = doc.getElementsByTagName("basfrmList");
            List<FormMaterialEntity> formMaterials = parseFormMaterials(formMaterialNodes, welfare.getId());

            NodeList basisStatuteNodes = doc.getElementsByTagName("baslawList");
            List<BasisStatuteEntity> basisStatutes = parseBasisStatutes(basisStatuteNodes, welfare.getId());

            return WelfareDetailDto.builder()
                    .welfare(welfare)
                    .institutions(institutions)
                    .inquiryContacts(inquiryContacts)
                    .inquiryLinks(inquiryLinks)
                    .formMaterials(formMaterials)
                    .basisStatutes(basisStatutes)
                    .build();
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    private List<InstitutionEntity> parseInstitutions(NodeList institutionNodes, String welfareId) {
        List<InstitutionEntity> institutions = new ArrayList<>();
        for (int i = 0; i < institutionNodes.getLength(); i++) {
            Element el = (Element) institutionNodes.item(i);

            InstitutionEntity institution = new InstitutionEntity();
            institution.setWelfareId(welfareId);
            institution.setName(getTagValue(el, "servSeDetailNm"));
            institution.setDescription(getTagValue(el, "servSeDetailLink"));
            if (institution.getName() != null && institution.getDescription() != null) {
                institutions.add(institution);
            }
        }
        return institutions;
    }

    private List<InquiryContactEntity> parseInquiryContacts(NodeList inquiryContactNodes, String welfareId) {
        List<InquiryContactEntity> inquiryContacts = new ArrayList<>();
        for (int i = 0; i < inquiryContactNodes.getLength(); i++) {
            Element el = (Element) inquiryContactNodes.item(i);

            InquiryContactEntity inquiryContact = new InquiryContactEntity();
            inquiryContact.setWelfareId(welfareId);
            inquiryContact.setName(getTagValue(el, "servSeDetailNm"));
            inquiryContact.setContact(getTagValue(el, "servSeDetailLink"));
            if (inquiryContact.getName() != null && inquiryContact.getContact() != null) {
                inquiryContacts.add(inquiryContact);
            }
        }
        return inquiryContacts;
    }

    private List<InquiryLinkEntity> parseInquiryLinks(NodeList inquiryLinkNodes, String welfareId) {
        List<InquiryLinkEntity> inquiryLinks = new ArrayList<>();
        for (int i = 0; i < inquiryLinkNodes.getLength(); i++) {
            Element el = (Element) inquiryLinkNodes.item(i);

            InquiryLinkEntity inquiryLink = new InquiryLinkEntity();
            inquiryLink.setWelfareId(welfareId);
            inquiryLink.setName(getTagValue(el, "servSeDetailNm"));
            inquiryLink.setLink(getTagValue(el, "servSeDetailLink"));
            if (inquiryLink.getName() != null && inquiryLink.getLink() != null) {
                inquiryLinks.add(inquiryLink);
            }
        }
        return inquiryLinks;
    }

    private List<FormMaterialEntity> parseFormMaterials(NodeList formMaterialNodes, String welfareId) {
        List<FormMaterialEntity> formMaterials = new ArrayList<>();
        for (int i = 0; i < formMaterialNodes.getLength(); i++) {
            Element el = (Element) formMaterialNodes.item(i);

            FormMaterialEntity formMaterial = new FormMaterialEntity();
            formMaterial.setWelfareId(welfareId);
            formMaterial.setName(getTagValue(el, "servSeDetailNm"));
            formMaterial.setLink(getTagValue(el, "servSeDetailLink"));
            if (formMaterial.getName() != null && formMaterial.getLink() != null) {
                formMaterials.add(formMaterial);
            }
        }
        return formMaterials;
    }

    private List<BasisStatuteEntity> parseBasisStatutes(NodeList basisStatuteNodes, String welfareId) {
        List<BasisStatuteEntity> basisStatutes = new ArrayList<>();
        for (int i = 0; i < basisStatuteNodes.getLength(); i++) {
            Element el = (Element) basisStatuteNodes.item(i);

            BasisStatuteEntity basisStatute = new BasisStatuteEntity();
            basisStatute.setWelfareId(welfareId);
            basisStatute.setName(getTagValue(el, "servSeDetailNm"));
            if (basisStatute.getName() != null) {
                basisStatutes.add(basisStatute);
            }
        }
        return basisStatutes;
    }

    private String getTagValue(Element parent, String tag) {
        NodeList node = parent.getElementsByTagName(tag);
        if (node.getLength() == 0) {
            return null;
        }

        String value = node.item(0).getTextContent();
        return (value == null || value.isBlank())
                ? null
                : value.trim();
    }

    private List<String> getTagListValue(Element parent, String tag) {
        NodeList node = parent.getElementsByTagName(tag);
        if (node.getLength() == 0) {
            return Collections.emptyList();
        }

        String value = node.item(0).getTextContent();
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(value.split(","))
                .collect(Collectors.toList());
    }

    private WelfareApiResult getWelfareApiResult(String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xmlResponse)));

            Element rootElement = doc.getDocumentElement();
            String resultCode = rootElement.getElementsByTagName("resultCode")
                    .item(0)
                    .getTextContent();
            System.out.println("resultCode : " + resultCode);

            return switch (resultCode) {
                case "04" -> WelfareApiResult.HTTP_ERROR;
                case "10" -> WelfareApiResult.INVALID_REQUEST_PARAMETER_ERROR;
                case "12" -> WelfareApiResult.NO_OPENAPI_SERVICE_ERROR;
                case "20" -> WelfareApiResult.SERVICE_ACCESS_DENIED_ERROR;
                case "22" -> WelfareApiResult.LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR;
                case "30" -> WelfareApiResult.SERVICE_KEY_IS_NOT_REGISTERED_ERROR;
                case "31" -> WelfareApiResult.DEADLINE_HAS_EXPIRED_ERROR;
                case "40" -> WelfareApiResult.NO_DATA_FOUND;
                case "99" -> WelfareApiResult.UNKNOWN_ERROR;
                case "0" -> WelfareApiResult.SUCCESS;
                default -> WelfareApiResult.SUCCESS;
            };
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean getLikeStatus(UserEntity signedUser, String welfareId) {
        if (signedUser == null) {
            System.out.println("에러 - 로그인 안됨");
            return false;
        }
        if (welfareId.isEmpty()) {
            System.out.println("에러 - 복지 ID 값이 비어있음");
            return false;
        } else {
            return this.welfareLikesMapper.selectCountByWelfareIdAndUserIndex(welfareId, signedUser.getIndex()) > 0;
        }
    }

    public Boolean toggleLike(UserEntity signedUser, String welfareId) {
        if (signedUser == null || welfareId.isEmpty()) {
            System.out.println("여기 에러인거같음");
            return null;
        }

        // 현재 좋아요 상태 확인
        if (this.welfareLikesMapper.selectCountByWelfareIdAndUserIndex(welfareId, signedUser.getIndex()) < 1) {
            // 좋아요 추가
            WelfareLikesEntity welfareLike = WelfareLikesEntity.builder()
                    .welfareId(welfareId)
                    .userIndex(signedUser.getIndex())
                    .createdAt(LocalDateTime.now())
                    .build();
            System.out.println("좋아요 추가");
            return this.welfareLikesMapper.insert(welfareLike) > 0 ? true : null;
        } else {
            // 좋아요 취소
            System.out.println("좋아요 취소");
            return this.welfareLikesMapper.delete(welfareId, signedUser.getIndex()) > 0 ? false : null;
        }
    }

    public boolean deleteLike(UserEntity signedUser, String welfareId) {
        if (signedUser == null || welfareId.isEmpty()) {
            System.out.println("여기 에러인거같음");
            return false;
        }

        // 현재 좋아요 상태 확인
        if (this.welfareLikesMapper.selectCountByWelfareIdAndUserIndex(welfareId, signedUser.getIndex()) > 0) {
            return this.welfareLikesMapper.delete(welfareId, signedUser.getIndex()) > 0;
        } else {
            return false;
        }
    }

    public Boolean updateAlarm(String welfareId, UserEntity signedUser, LocalDate alarmAt) {
        System.out.println("서비스 도착" + welfareId + " / " + alarmAt);

        return this.welfareLikesMapper.updateAlarmAt(welfareId, signedUser.getIndex(), alarmAt) > 0;
    }

    public WelfareFavoriteDto[] getAll(UserEntity signedUser) {
        return this.welfareLikesMapper.selectAllByUser(signedUser.getIndex());
    }

    public WelfareFavoriteDto[] getAllAlarm(UserEntity signedUser) {
        return this.welfareLikesMapper.selectAllAlarmByUser(signedUser.getIndex());
    }

    public WelfareFavoriteDto[] getHomeAlarms(UserEntity signedUser) {
        if (signedUser == null) {
            System.out.println("에러 - 로그인 안됨");
            return new WelfareFavoriteDto[0];
        }

        // 기존 메서드 사용
        WelfareFavoriteDto[] alarms = this.welfareLikesMapper.selectAllHomeAlarmByUser(signedUser.getIndex());

        // daysDiff 계산
        for (WelfareFavoriteDto alarm : alarms) {
            LocalDate today = LocalDate.now();
            LocalDate alarmDate = alarm.getAlarmAt();

            long daysDiff = alarmDate.toEpochDay() - today.toEpochDay();
            alarm.setDaysDiff((int) daysDiff);
        }

        return alarms;
    }
}
