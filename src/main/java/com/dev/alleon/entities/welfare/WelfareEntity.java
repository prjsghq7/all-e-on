package com.dev.alleon.entities.welfare;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class WelfareEntity {
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

    private String lifeArray;           // 생애 주기
    private String trgterIndvdlArray;    // 가구 유형
    private String intrsThemaArray;     // 관심 주제
    
    private int views;                  //조회수
}
