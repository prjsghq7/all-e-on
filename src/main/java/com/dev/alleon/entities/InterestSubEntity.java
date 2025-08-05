package com.dev.alleon.entities;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "code")
public class InterestSubEntity {
    private String code;
    private String displayText;

}
