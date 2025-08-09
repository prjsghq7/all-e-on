package com.dev.alleon.entities.welfare;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class InstitutionEntity {
    //서비스 이용 기관 내용
    int id;
    String welfareId;
    String name;
    String description;
}
