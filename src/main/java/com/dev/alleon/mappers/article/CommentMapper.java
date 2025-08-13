package com.dev.alleon.mappers.article;

import com.dev.alleon.entities.article.CommentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CommentMapper {
    int insert(@Param("comment") CommentEntity comment);
}
