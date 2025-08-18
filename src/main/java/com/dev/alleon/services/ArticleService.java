package com.dev.alleon.services;

import com.dev.alleon.dtos.article.ArticleDto;
import com.dev.alleon.dtos.article.ArticleListResponse;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.article.ArticleEntity;
import com.dev.alleon.mappers.UserMapper;
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
    private final UserMapper userMapper;

    @Autowired
    public ArticleService(ArticleMapper articleMapper, UserMapper userMapper) {
        this.articleMapper = articleMapper;
        this.userMapper = userMapper;
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

    public ArticleDto getArticleByIndex(int index) {
        return articleMapper.selectByIndex(index);
    }

    public ArticleListResponse getArticleList(ArticleSearchVo searchVo,
                                              int page) {
        int totalCount = this.articleMapper.selectCount(searchVo);

        PageVo pageVo = new PageVo(NUMBER_OF_ROWS, page, totalCount);
        List<ArticleDto> articles = this.articleMapper.selectList(searchVo, pageVo);

        return new ArticleListResponse(articles, pageVo);
    }

    public Result modify(UserEntity signedUser, ArticleEntity article) {
        if (signedUser == null || signedUser.getActiveState() >= 2) {
            return CommonResult.FAILURE_ABSENT;
        }
        if (article == null) {
            return CommonResult.FAILURE;
        }
        ArticleEntity dbArticle = this.articleMapper.selectArticleEntityByIndex(article.getIndex());
        if (dbArticle == null || dbArticle.isDeleted()) {
            return CommonResult.FAILURE_DOESNT_EXIST;
        }
        if (signedUser.getIndex() != dbArticle.getUserIndex()) {
            return CommonResult.FAILURE_NOT_SAME;
        }
        dbArticle.setTitle(article.getTitle());
        dbArticle.setContent(article.getContent());
        dbArticle.setModifiedAt(LocalDateTime.now());
        dbArticle.setDeleted(false);
        return this.articleMapper.update(dbArticle) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public Result delete(UserEntity signedUser, int index) {
        if (signedUser == null || signedUser.getActiveState() >= 2) {
            return CommonResult.FAILURE_ABSENT;
        }
        ArticleEntity dbArticle = this.articleMapper.selectArticleEntityByIndex(index);
        if (dbArticle == null || dbArticle.isDeleted()) {
            return CommonResult.FAILURE_DOESNT_EXIST;
        }
        if (signedUser.getIndex() != dbArticle.getUserIndex()) {
            return CommonResult.FAILURE_NOT_SAME;
        }
        dbArticle.setModifiedAt(LocalDateTime.now());
        dbArticle.setDeleted(true);
        return this.articleMapper.update(dbArticle) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }
}
