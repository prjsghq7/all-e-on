package com.dev.alleon.services;

import com.dev.alleon.dtos.Comment.CommentDto;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.article.ArticleEntity;
import com.dev.alleon.entities.article.CommentEntity;
import com.dev.alleon.mappers.article.CommentMapper;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import com.dev.alleon.vos.PageVo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {
    private static final int NUM_OF_ROWS = 10;

    private final CommentMapper commentMapper;

    public CommentService(CommentMapper commentMapper) {
        this.commentMapper = commentMapper;
    }

    public Result addComment(UserEntity signedUser, CommentEntity comment) {
        if (signedUser == null
                || signedUser.getActiveState() >= 2
                || comment == null
                || comment.getArticleIndex() < 0) {
            return CommonResult.FAILURE_ABSENT;
        }
        comment.setUserIndex(signedUser.getIndex());
        comment.setDeleted(false);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setModifiedAt(null);
        return this.commentMapper.insert(comment) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public List<CommentDto> getCommentsByArticle(int articleIndex, int page) {
        if (articleIndex < 0) {
            return null;
        }

        int totalCount = this.commentMapper.totalCountByArticleIndex(articleIndex);
        PageVo pageVo = new PageVo(page, NUM_OF_ROWS, totalCount);

        List<CommentDto> comments = this.commentMapper.getCommentByArticleIndex(articleIndex, pageVo);
        return comments;
    }

}
