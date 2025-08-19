package com.dev.alleon.mappers.article;

import com.dev.alleon.dtos.Comment.CommentDto;
import com.dev.alleon.entities.article.CommentEntity;
import com.dev.alleon.vos.PageVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.security.core.parameters.P;

import java.util.List;

@Mapper
public interface CommentMapper {
    int insert(@Param("comment") CommentEntity comment);

    List<CommentDto> getCommentByArticleIndex(@Param("articleIndex") int articleIndex, PageVo pageVo, @Param("currentUserIndex") int currentUserIndex);

    int totalCountByArticleIndex(@Param("articleIndex") int articleIndex);

    CommentEntity selectByIndex(@Param("index") int index);

    int update(@Param("comment") CommentEntity comment);
}
