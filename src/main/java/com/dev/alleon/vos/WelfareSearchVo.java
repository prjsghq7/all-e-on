package com.dev.alleon.vos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class WelfareSearchVo {
    private String searchKeyCode;
    private String keyword;
    private String code;
}
