package com.dev.alleon.dtos.welfare;

import com.dev.alleon.vos.PageVo;
import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class WelfareListResponse {
    private List<WelfareListDto> welfareList;
    private PageVo pageVo;
}
