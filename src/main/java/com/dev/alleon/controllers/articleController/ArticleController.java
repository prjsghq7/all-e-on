package com.dev.alleon.controllers.articleController;

import com.dev.alleon.dtos.article.ArticleListResponse;
import com.dev.alleon.services.ArticleService;
import com.dev.alleon.vos.ArticleSearchVo;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping(value="/article")
public class ArticleController {
    private final ArticleService articleService;
    

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @RequestMapping(value = "/",method= RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(@RequestParam(value = "index", required = false) String index,
                           Model model){
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
}
