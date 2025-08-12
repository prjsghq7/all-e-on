package com.dev.alleon.mappers.welfare;

import com.dev.alleon.entities.welfare.FormMaterialEntity;
import com.dev.alleon.entities.welfare.InstitutionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FormMaterialMapper {
    int insert(@Param("formMaterial") FormMaterialEntity formMaterial);

    List<FormMaterialEntity> selectByWelfareId(@Param("welfareId") String welfareId);
}
