package com.dev.alleon.mappers.welfare;

import com.dev.alleon.entities.welfare.InquiryLinkEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InquiryLinkMapper {
    int insert(@Param("inquiryLink") InquiryLinkEntity inquiryLink);

    List<InquiryLinkEntity> selectByWelfareId(@Param("welfareId") String welfareId);
}
