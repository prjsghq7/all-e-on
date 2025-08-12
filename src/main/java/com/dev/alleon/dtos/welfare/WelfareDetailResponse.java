package com.dev.alleon.dtos.welfare;

import com.dev.alleon.entities.welfare.*;
import lombok.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class WelfareDetailResponse {
    private String id;              // 서비스 ID
    private String name;            // 서비스 명
    private String ministryName;    // 소관 부처명

    private String targetDetailContent;         // 대상자 상세내용
    private String selectionCriteriaContent;    // 선정기준 내용
    private String allowanceServiceContent;     // 급여서비스 내용

    private String criteriaYear;        // 기준년
    private String summary;             // 서비스요약
    private String supportCycle;        // 지원주기
    private String serviceProvision;    // 제공유형

    private List<String> lifeArray;           // 생애 주기
    private List<String> rgterIndvdlArray;    // 가구 유형
    private List<String> intrsThemaArray;     // 관심 주제

    private int views;                  //조회수

    private List<InstitutionEntity> institutions;
    private List<InquiryContactEntity> inquiryContacts;
    private List<InquiryLinkEntity> inquiryLinks;
    private List<FormMaterialEntity> formMaterials;
    private List<BasisStatuteEntity> basisStatutes;

    public WelfareDetailResponse(WelfareEntity welfare) {
        this.id = welfare.getId();
        this.name = welfare.getName();
        this.ministryName = welfare.getMinistryName();

        this.targetDetailContent = welfare.getTargetDetailContent();
        this.selectionCriteriaContent = welfare.getSelectionCriteriaContent();
        this.allowanceServiceContent = welfare.getAllowanceServiceContent();

        this.criteriaYear = welfare.getCriteriaYear();
        this.summary = welfare.getSummary();
        this.supportCycle = welfare.getSupportCycle();
        this.serviceProvision = welfare.getServiceProvision();

        this.lifeArray = welfare.getLifeArray() == null
                ? null
                : Arrays.stream(welfare.getLifeArray().split(","))
                .collect(Collectors.toList());
        ;
        this.rgterIndvdlArray = welfare.getRgterIndvdlArray() == null
                ? null
                : Arrays.stream(welfare.getRgterIndvdlArray().split(","))
                .collect(Collectors.toList());
        ;
        this.intrsThemaArray = welfare.getRgterIndvdlArray() == null
                ? null
                : Arrays.stream(welfare.getTargetDetailContent().split(","))
                .collect(Collectors.toList());
        ;

        this.views = welfare.getViews();
    }
}
