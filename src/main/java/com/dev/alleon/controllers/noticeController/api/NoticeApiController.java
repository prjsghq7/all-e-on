package com.dev.alleon.controllers.noticeController.api;

import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.notice.ImageEntity;
import com.dev.alleon.entities.notice.NoticeEntity;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import com.dev.alleon.results.ResultTuple;
import com.dev.alleon.services.ImageService;
import com.dev.alleon.services.NoticeService;
import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping(value = "/api/notice")
public class NoticeApiController {
    private final ImageService imageService;
    private final NoticeService noticeService;

    public NoticeApiController(ImageService imageService, NoticeService noticeService) {
        this.imageService = imageService;
        this.noticeService = noticeService;
    }

    @RequestMapping(value = "/image", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postNoticeImage(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, NoticeEntity notice, @RequestParam(value = "upload", required = false) MultipartFile multipartFile) throws IOException {
        System.out.println("image controller");
        ImageEntity image = ImageEntity.builder()
                .name(multipartFile.getOriginalFilename())
                .contentType(multipartFile.getContentType())
                .data(multipartFile.getBytes())
                .build();
        Result result = this.imageService.add(signedUser, notice, image);
        JSONObject response = new JSONObject();
        if (result == CommonResult.SUCCESS) {
            System.out.println("등록 성공");
            response.put("url", "/notice/image?index=" + image.getIndex());
        } else if (result == CommonResult.FAILURE_SESSION_EXPIRED) {
            System.out.println("로그인 확인");
        } else if (result == CommonResult.FAILURE) {
            System.out.println("등록 실패");
        }
        return response.toString();
    }

    @RequestMapping(value = "/submit", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public String postSubmit(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, NoticeEntity notice) {
        Result result = this.noticeService.add(signedUser, notice);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/modify", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    public String getModify(NoticeEntity notice, @SessionAttribute(value = "signedUser") UserEntity signedUser) {
        Result result = this.noticeService.modify(signedUser, notice);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/delete", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    public String delete(@SessionAttribute(value = "signedUser") UserEntity signedUser, @RequestParam(value = "index") int index) {
        Result result = this.noticeService.delete(signedUser, index);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

}
