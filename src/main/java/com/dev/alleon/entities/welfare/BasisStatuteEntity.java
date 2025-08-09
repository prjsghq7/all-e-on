package com.dev.alleon.entities.welfare;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class BasisStatuteEntity {
    //근거 법령
    int id;
    String welfareId;
    String name;
}
