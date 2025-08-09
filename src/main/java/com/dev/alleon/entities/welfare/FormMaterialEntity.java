package com.dev.alleon.entities.welfare;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class FormMaterialEntity {
    // 서식 자료
    int id;
    String welfareId;
    String name;
    String link;
}
