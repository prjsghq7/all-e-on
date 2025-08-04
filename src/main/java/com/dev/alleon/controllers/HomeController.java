package com.dev.alleon.controllers;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(value = "/")
public class HomeController {
    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIntro() {
        return "home/intro";
    }

//    @RequestMapping(value = "/home", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
//    public String getHome(){
//        return "home/home";
//    }
}
