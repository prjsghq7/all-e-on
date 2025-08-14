package com.dev.alleon.mappers.images;

import com.dev.alleon.entities.notice.ImageEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ImageMapper {
    int insert(@Param(value = "image") ImageEntity image);

    ImageEntity selectByIndex(@Param(value = "index") int index);
}
