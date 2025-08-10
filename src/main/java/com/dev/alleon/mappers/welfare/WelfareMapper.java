package com.dev.alleon.mappers.welfare;

import com.dev.alleon.entities.welfare.WelfareEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WelfareMapper {
    int insert(@Param("welfare") WelfareEntity welfare);

    int selectCountById(@Param("id") String id);

    WelfareEntity selectById(@Param("id") String id);
}
