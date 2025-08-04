package com.dev.alleon.entities;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "code")
public class CodeEntity {
    private String code;
    private String displayText;
}
