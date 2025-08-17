package com.dev.alleon.services;

import com.dev.alleon.dtos.Comment.CommentDto;
import com.dev.alleon.dtos.Comment.RecommentDto;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.article.ArticleEntity;
import com.dev.alleon.entities.article.CommentEntity;
import com.dev.alleon.entities.article.RecommentEntity;
import com.dev.alleon.mappers.article.CommentMapper;
import com.dev.alleon.mappers.article.RecommentMapper;
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
    private final RecommentMapper recommentMapper;

    public CommentService(CommentMapper commentMapper, RecommentMapper recommentMapper) {
        this.commentMapper = commentMapper;
        this.recommentMapper = recommentMapper;
    }

    public Result addComment(UserEntity signedUser, CommentEntity comment) {
        if (signedUser == null
                || signedUser.getActiveState() >= 2
                || comment == null
                || comment.getArticleIndex() == null
                || comment.getArticleIndex() < 0) {
            return CommonResult.FAILURE_ABSENT;
        }
        comment.setUserIndex(signedUser.getIndex());
        comment.setDeleted(false);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setModifiedAt(null);
        return this.commentMapper.insert(comment) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public Result addRecomment(UserEntity signedUser, RecommentEntity recomment) {
        if (signedUser == null || recomment == null ||
                signedUser.getActiveState() >= 2 ||
                recomment.getCommentIndex() < 0) {
            return CommonResult.FAILURE_ABSENT;
        }
        CommentEntity parentComment = this.commentMapper.selectByIndex(recomment.getCommentIndex());
        if(parentComment == null || parentComment.isDeleted()) {
            return CommonResult.FAILURE_ABSENT;
        }
        recomment.setUserIndex(signedUser.getIndex());
        recomment.setCreatedAt(LocalDateTime.now());
        recomment.setModifiedAt(null);
        recomment.setDeleted(false);
        return this.recommentMapper.insert(recomment) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public List<RecommentDto> getWholeRecomments(int commentIndex) {
        if (commentIndex < 0) {
            return null;
        }

        List<RecommentDto> wholeRecomments = this.recommentMapper.getWholeRecomments(commentIndex);
        return wholeRecomments;
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
