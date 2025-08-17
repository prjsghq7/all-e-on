package com.dev.alleon.services;

import com.dev.alleon.dtos.article.ArticleDto;
import com.dev.alleon.dtos.article.ArticleListResponse;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.article.ArticleEntity;
import com.dev.alleon.mappers.article.ArticleMapper;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import com.dev.alleon.vos.ArticleSearchVo;
import com.dev.alleon.vos.PageVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ArticleService {
    private static final int NUMBER_OF_ROWS = 10;

    private final ArticleMapper articleMapper;

    @Autowired
    public ArticleService(ArticleMapper articleMapper) {
        this.articleMapper = articleMapper;
    }

    public Result insert(UserEntity signedUser, ArticleEntity article) {
        if (signedUser == null
                || signedUser.getActiveState() >= 2
                || article == null) {
            return CommonResult.FAILURE_ABSENT;
        }
        article.setUserIndex(signedUser.getIndex());
        article.setCreatedAt(LocalDateTime.now());
        article.setModifiedAt(null);
        article.setDeleted(false);
        article.setView(0);
        return articleMapper.insert(article) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public ArticleDto getArticleByIndex (int index) {
        return articleMapper.selectByIndex(index);
    }

    public ArticleListResponse getArticleList (ArticleSearchVo searchVo,
                                               int page) {
        int totalCount = this.articleMapper.selectCount(searchVo);

        PageVo pageVo = new PageVo(NUMBER_OF_ROWS, page, totalCount);
        List<ArticleDto> articles = this.articleMapper.selectList(searchVo, pageVo);

        return new ArticleListResponse(articles, pageVo);
    }
}
