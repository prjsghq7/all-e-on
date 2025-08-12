package com.dev.alleon.mappers.welfare;

import com.dev.alleon.entities.welfare.InquiryContactEntity;
import com.dev.alleon.entities.welfare.InstitutionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InquiryContactMapper {
    int insert(@Param("inquiryContact") InquiryContactEntity inquiryContact);

    List<InquiryContactEntity> selectByWelfareId(@Param("welfareId") String welfareId);
}
