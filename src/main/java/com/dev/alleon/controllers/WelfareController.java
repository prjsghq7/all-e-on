package com.dev.alleon.controllers;

import com.dev.alleon.dtos.welfare.WelfareDetailResponse;
import com.dev.alleon.dtos.welfare.WelfareListResponse;
import com.dev.alleon.entities.CodeEntity;
import com.dev.alleon.entities.welfare.WelfareEntity;
import com.dev.alleon.services.WelfareService;
import com.dev.alleon.vos.WelfareSearchVo;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Arrays;
import java.util.List;

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
    public String getDetail(@RequestParam(value = "id", required = false) String id,
                            Model model) {
        WelfareDetailResponse welfare = this.welfareService.getWelfareDetail(id);
        model.addAttribute("welfare", welfare);
        return "welfare/detail";
    }
}
