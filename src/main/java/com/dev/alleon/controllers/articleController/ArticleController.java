package com.dev.alleon.controllers.articleController;

import com.dev.alleon.dtos.article.ArticleDto;
import com.dev.alleon.dtos.article.ArticleListResponse;
import com.dev.alleon.entities.notice.ImageEntity;
import com.dev.alleon.services.ArticleService;
import com.dev.alleon.services.ImageService;
import com.dev.alleon.vos.ArticleSearchVo;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping(value="/article")
public class ArticleController {
    private final ArticleService articleService;
    private final ImageService imageService;

    public ArticleController(ArticleService articleService, ImageService imageService) {
        this.articleService = articleService;
        this.imageService = imageService;
    }

    @RequestMapping(value = "/",method= RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(@RequestParam(value = "index", required = false) int index,
                           Model model) {
        ArticleDto article = this.articleService.getArticleByIndex(index);
        model.addAttribute("article", article);
        return "article/article";
    }

    @RequestMapping(value = "/list",method= RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public String getList (ArticleSearchVo articleSearchVo,
                           @RequestParam(value = "page", required = false, defaultValue = "1") int page,
                           Model model) {
        ArticleListResponse articleListResponse = this.articleService.getArticleList(articleSearchVo, page);
        model.addAttribute("articleList", articleListResponse.getArticles());
        model.addAttribute("pageVo", articleListResponse.getPageVo());
        model.addAttribute("searchVo", articleSearchVo);

        return "article/list";
    }

    @RequestMapping(value = "/write",method= RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public String getWrite () {
        return "article/write";
    }

    @RequestMapping(value = "/image", method = RequestMethod.GET)
    public ResponseEntity<byte[]> getImage(@RequestParam(value = "index", required = false) int index) {
        //responseentity는 응답을 돌려주기위한 상태 타입.
        ImageEntity image = this.imageService.getByIndex(index);
        if (image == null) {
            return ResponseEntity.notFound().build();
            //notFound()는 404를 날린다.
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + UriUtils.encode(image.getName(), StandardCharsets.UTF_8) + "\"")
                .contentLength(image.getData().length)
                .contentType(MediaType.parseMediaType(image.getContentType())) //문자열이라서 mediatype으로 바꿔주어야한다.
                .body(image.getData());//ok는 상태코드 200;
    }
}
