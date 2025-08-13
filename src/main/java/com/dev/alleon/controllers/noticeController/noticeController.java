package com.dev.alleon.controllers.noticeController;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(value="/notice")
public class noticeController {
    @RequestMapping(value = "/",method = RequestMethod.GET,produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(){
        return "notice/notice";
    }
}
