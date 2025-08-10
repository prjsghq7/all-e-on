package com.dev.alleon.controllers.homeController;

import com.dev.alleon.dtos.home.HomeRecommendDto;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.services.UserService;
import com.dev.alleon.services.WelfareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttribute;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping(value = "/")
public class HomeController {
    @Autowired
    private WelfareService welfareService;

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIntro() {
        return "home/intro";
    }

    @RequestMapping(value = "/home", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getHome(@SessionAttribute(value = "signedUser", required = false) UserEntity singedUser, Model model) {
        if (singedUser != null) {
            List<HomeRecommendDto> homeRecommendDtos = new ArrayList<>();
            homeRecommendDtos.addAll(this.welfareService.getHomeRecommendList(singedUser.getLifeCycleCode(), "lifeArray"));
            homeRecommendDtos.addAll(this.welfareService.getHomeRecommendList(singedUser.getHouseholdTypeCode(), "trgterIndvdlArray"));
            homeRecommendDtos.addAll(this.welfareService.getHomeRecommendList(singedUser.getInterestSubCode(), "IntrsThemaArray"));
            model.addAttribute("allRecommends", homeRecommendDtos);
        }
        return "home/home";
    }

}
