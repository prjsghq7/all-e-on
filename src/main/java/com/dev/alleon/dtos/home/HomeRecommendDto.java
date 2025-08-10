package com.dev.alleon.dtos.home;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "servId")
public class HomeRecommendDto {
    private String servId; // 아이디
    private String servNm; // 이름
    private String servDgst; //요약
}
