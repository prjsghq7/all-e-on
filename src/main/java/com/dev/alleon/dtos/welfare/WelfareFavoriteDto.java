package com.dev.alleon.dtos.welfare;

import lombok.*;

import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class WelfareFavoriteDto {
    private int index;                  // 즐겨찾기한 서비스 Index
    private String welfareId;           // 서비스 ID
    private String welfareName;         // 서비스 명
    private String ministryName;        // 소관 부처명
    private String summary;             // 서비스요약
    private String supportCycle;        // 지원주기
    private String lifeArray;           // 생애 주기
    private LocalDate alarmAt;
}
