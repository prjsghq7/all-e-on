package com.dev.alleon.entities.welfare;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class InquiryContactEntity {
    // 문의처 연락
    int id;
    String welfareId;
    String name;
    String contact;
}
