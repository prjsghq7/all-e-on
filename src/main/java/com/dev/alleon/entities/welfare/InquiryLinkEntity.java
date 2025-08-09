package com.dev.alleon.entities.welfare;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class InquiryLinkEntity {
    // 문의처 링크
    int id;
    String welfareId;
    String name;
    String link;
}
