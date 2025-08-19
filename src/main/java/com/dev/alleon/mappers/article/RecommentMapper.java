package com.dev.alleon.mappers.article;

import com.dev.alleon.dtos.Comment.RecommentDto;
import com.dev.alleon.entities.article.RecommentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RecommentMapper {
    int insert(@Param("recomment") RecommentEntity recomment);

    List<RecommentDto> getWholeRecomments(@Param("commentIndex") int commentIndex,
                                          @Param("currentUserIndex") int currentUserIndex);

    RecommentEntity selectByIndex(@Param("index") int index);

    int update(@Param("recomment") RecommentEntity recomment);
}
