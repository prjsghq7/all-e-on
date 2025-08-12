package com.dev.alleon.mappers.welfare;

import com.dev.alleon.entities.welfare.BasisStatuteEntity;
import com.dev.alleon.entities.welfare.FormMaterialEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BasisStatuteMapper {
    int insert(@Param("basisStatute") BasisStatuteEntity basisStatute);

    List<BasisStatuteEntity> selectByWelfareId(@Param("welfareId") String welfareId);
}
