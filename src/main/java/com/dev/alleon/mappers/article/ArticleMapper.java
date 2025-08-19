package com.dev.alleon.mappers.article;

import com.dev.alleon.dtos.article.ArticleDto;
import com.dev.alleon.entities.article.ArticleEntity;
import com.dev.alleon.vos.ArticleSearchVo;
import com.dev.alleon.vos.PageVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArticleMapper {
    int insert(@Param("article") ArticleEntity article);

    int selectCount(@Param("searchVo") ArticleSearchVo searchVo);

    List<ArticleDto> selectList(@Param("searchVo") ArticleSearchVo searchVo,
                                @Param("pageVo") PageVo pageVo);

    ArticleDto selectByIndex(@Param("index") int index);

    ArticleEntity selectArticleEntityByIndex(@Param("index") int index);

    int update(@Param("article") ArticleEntity article);

    int increaseView(@Param("index") int index);
}
