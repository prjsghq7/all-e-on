package com.dev.alleon.mappers.article;

import com.dev.alleon.entities.article.RecommentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RecommentMapper {
    int insert(@Param("recomment") RecommentEntity recomment);
}
