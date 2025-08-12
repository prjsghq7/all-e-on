package com.dev.alleon.mappers.welfare;

import com.dev.alleon.entities.welfare.InstitutionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InstitutionMapper {
    int insert(@Param("institution") InstitutionEntity institution);

    List<InstitutionEntity> selectByWelfareId(@Param("welfareId") String welfareId);
}
