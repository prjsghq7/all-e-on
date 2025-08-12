package com.dev.alleon.dtos.welfare;

import com.dev.alleon.entities.welfare.*;
import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class WelfareDetailDto {
    private WelfareEntity welfare;
    private List<InstitutionEntity> institutions;
    private List<InquiryContactEntity> inquiryContacts;
    private List<InquiryLinkEntity> inquiryLinks;
    private List<FormMaterialEntity> formMaterials;
    private List<BasisStatuteEntity> basisStatutes;
}
