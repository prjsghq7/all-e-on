package com.dev.alleon.controllers.homeController.api;

import com.dev.alleon.dtos.welfare.WelfareFavoriteDto;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.services.WelfareService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/home")
public class HomeApiController {
    private final WelfareService welfareService;

    public HomeApiController(WelfareService welfareService) {
        this.welfareService = welfareService;
    }

    @RequestMapping(value = "/alarmList", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public WelfareFavoriteDto[] getAlarmList(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        return this.welfareService.getHomeAlarms(signedUser);
    }
}
