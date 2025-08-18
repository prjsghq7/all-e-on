package com.dev.alleon.controllers;

import com.dev.alleon.dtos.welfare.WelfareDetailResponse;
import com.dev.alleon.dtos.welfare.WelfareFavoriteDto;
import com.dev.alleon.dtos.welfare.WelfareListResponse;
import com.dev.alleon.entities.CodeEntity;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.welfare.WelfareEntity;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.services.WelfareService;
import com.dev.alleon.vos.WelfareSearchVo;
import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping(value = "/welfare")
public class WelfareController {
    private final WelfareService welfareService;

    public WelfareController(WelfareService welfareService) {
        this.welfareService = welfareService;
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getSearch(WelfareSearchVo welfareSearchVo,
                            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
                            Model model) {
        WelfareListResponse welfareListResponse = this.welfareService.getWelfareList(welfareSearchVo, page);
        model.addAttribute("welfareList", welfareListResponse.getWelfareList());
        model.addAttribute("pageVo", welfareListResponse.getPageVo());
        model.addAttribute("searchVo", welfareSearchVo);

        model.addAttribute("codes", this.welfareService.getWelfareSearchCodes(welfareSearchVo.getSearchType()));
        return "welfare/list";
    }

    @RequestMapping(value = "/detail", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getDetail(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @RequestParam(value = "id", required = false) String id,
                            Model model) {
        WelfareDetailResponse welfare = this.welfareService.getWelfareDetail(id);

        model.addAttribute("welfare", welfare);
        model.addAttribute("likeStatus", this.welfareService.getLikeStatus(signedUser, id));
        model.addAttribute("signedUser", signedUser);

        return "welfare/detail";
    }

    @RequestMapping(value = "/like", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchLike(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @RequestParam(value = "welfareId", required = false) String welfareId) {
        System.out.println(welfareId + " 컨트롤러 도착");
        Boolean result = this.welfareService.toggleLike(signedUser, welfareId);
        JSONObject response = new JSONObject();
        if (result == null) {
            response.put("result", CommonResult.FAILURE.toStringLower());
        } else {
            response.put("result", result);
        }
        return response.toString();
        // {result: failure} : 실패한 것
        // {result: true} : 좋아하게 된 것
        // {result: false} : 좋아하지 않게 된 것
    }

    @RequestMapping(value = "/like", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteLike(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             @RequestParam(value = "welfareId", required = false) String welfareId) {
        boolean result = this.welfareService.deleteLike(signedUser, welfareId);
        JSONObject response = new JSONObject();
        response.put("result", result);
        return response.toString();
    }

    @RequestMapping(value = "/alarm", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchAlarm(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             @RequestParam(value = "welfareId", required = false) String welfareId,
                             @RequestParam(value = "alarmAt", required = false) LocalDate alarmAt) {
        System.out.println(welfareId + " 컨트롤러 도착");
        Boolean result = this.welfareService.updateAlarm(welfareId, signedUser, alarmAt);
        JSONObject response = new JSONObject();
        if (result == null) {
            response.put("result", CommonResult.FAILURE.toStringLower());
        } else {
            response.put("result", result);
        }
        return response.toString();
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public WelfareFavoriteDto[] getList(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        return this.welfareService.getAll(signedUser);
    }

    @RequestMapping(value = "/alarmList", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public WelfareFavoriteDto[] getAlarmList(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        return this.welfareService.getAllAlarm(signedUser);
    }
}
