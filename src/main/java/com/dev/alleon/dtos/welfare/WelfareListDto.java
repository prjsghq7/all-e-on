package com.dev.alleon.dtos.welfare;

import lombok.*;

import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "servId")
public class WelfareListDto {
    private String servId;      // 서비스 ID
    private String servNm;      // 서비스 명

    private String lifeArray;           // 생애 주기
    private String trgterIndvdlArray;   // 가구 유형
    private String intrsThemaArray;     // 관심 주제

    private String jurMnofNm;       // 소관 부처명
    private String jurOrgNm;        // 소관 조직명

    private LocalDate svcfrstRegTs;    // 서비스 등록일
    private String servDgst;        // 서비스 요약
    private String sprtCycNm;       // 지원 주기
    private String srvPvsnNm;       // 제공 유형

    private String onapPsbltYn; // 온라인 신청 가능 여부
    private String rprsCtadr;   // 문의처
    private String servDtlLink; // 서비스 상세 링크

    private int inqNum;         // 조회수
}
