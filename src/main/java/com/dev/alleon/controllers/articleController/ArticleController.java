package com.dev.alleon.controllers.articleController;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(value="/article")
public class ArticleController {
    @RequestMapping(value = "/",method= RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(){
        return "article/article";
    }
}
