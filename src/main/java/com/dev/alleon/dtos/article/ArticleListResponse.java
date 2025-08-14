package com.dev.alleon.dtos.article;

import com.dev.alleon.entities.article.ArticleEntity;
import com.dev.alleon.vos.PageVo;
import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ArticleListResponse {
    List<ArticleDto> articles;
    PageVo pageVo;
}
