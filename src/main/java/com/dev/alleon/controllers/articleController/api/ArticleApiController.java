package com.dev.alleon.controllers.articleController.api;

import com.dev.alleon.dtos.Comment.CommentDto;
import com.dev.alleon.dtos.Comment.RecommentDto;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.article.ArticleEntity;
import com.dev.alleon.entities.article.CommentEntity;
import com.dev.alleon.entities.article.RecommentEntity;
import com.dev.alleon.entities.notice.ImageEntity;
import com.dev.alleon.entities.notice.NoticeEntity;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import com.dev.alleon.services.ArticleService;
import com.dev.alleon.services.CommentService;
import com.dev.alleon.services.ImageService;
import com.google.api.client.json.Json;
import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = "/api/article")
public class ArticleApiController {
    private final ImageService imageService;
    private final ArticleService articleService;
    private final CommentService commentService;

    public ArticleApiController(ImageService imageService, ArticleService articleService, CommentService commentService) {
        this.imageService = imageService;
        this.articleService = articleService;
        this.commentService = commentService;
    }

    @RequestMapping(value = "/image", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postArticleImage(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, NoticeEntity notice, @RequestParam(value = "upload", required = false) MultipartFile multipartFile) throws IOException {
        ImageEntity image = ImageEntity.builder()
                .name(multipartFile.getOriginalFilename())
                .contentType(multipartFile.getContentType())
                .data(multipartFile.getBytes())
                .build();
        Result result = this.imageService.add(signedUser, notice, image);
        JSONObject response = new JSONObject();
        if (result == CommonResult.SUCCESS) {
            System.out.println("등록 성공");
            response.put("url", "/article/image?index=" + image.getIndex());
        } else if (result == CommonResult.FAILURE_SESSION_EXPIRED) {
            System.out.println("로그인 확인");
        } else if (result == CommonResult.FAILURE) {
            System.out.println("등록 실패");
        }
        return response.toString();
    }

    @RequestMapping(value = "/write", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postWrite(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, ArticleEntity article) {
        Result result = this.articleService.insert(signedUser, article);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }


    @RequestMapping(value = "/comments", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<CommentDto> getComments(@RequestParam(value = "articleIndex") int articleIndex,
                                        @RequestParam(value = "page") int page) {
        return this.commentService.getCommentsByArticle(articleIndex, page);
    }

    @RequestMapping(value = "/comment/upload", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postCommentUpload(@SessionAttribute(value = "signedUser",required = false) UserEntity signedUser, CommentEntity comment) {
        Result result = this.commentService.addComment(signedUser, comment);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value="/recomments/upload", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postRecommentsUpload(@SessionAttribute(value="signedUser",required = false)UserEntity signedUser, RecommentEntity recomment){
        Result result = this.commentService.addRecomment(signedUser, recomment);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value="/recomments",method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<RecommentDto> getRecomments(@RequestParam(value="commentIndex")int commentIndex){
        return this.commentService.getWholeRecomments(commentIndex);
    }
}
