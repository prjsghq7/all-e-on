package com.dev.alleon.mappers.welfare;

import com.dev.alleon.entities.CodeEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface HouseholdTypeMapper {
    List<CodeEntity> selectAll();
}
