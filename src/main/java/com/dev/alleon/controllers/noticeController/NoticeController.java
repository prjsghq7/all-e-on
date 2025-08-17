package com.dev.alleon.controllers.noticeController;

import com.dev.alleon.entities.notice.ImageEntity;
import com.dev.alleon.entities.notice.NoticeEntity;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.ResultTuple;
import com.dev.alleon.services.ImageService;
import com.dev.alleon.services.NoticeService;
import com.dev.alleon.vos.PageVo;
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
@RequestMapping(value = "/notice")
public class NoticeController {
    private final NoticeService noticeService;
    private final ImageService imageService;

    public NoticeController(NoticeService noticeService, ImageService imageService) {
        this.noticeService = noticeService;
        this.imageService = imageService;
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(Model model, @RequestParam(value = "page", required = false, defaultValue = "1") int page) {
        PageVo pageVo = this.noticeService.page(page);
        ResultTuple<NoticeEntity[]> result = this.noticeService.getAllNotice(pageVo);
        if (result.getResult() == CommonResult.SUCCESS) {
            model.addAttribute("notices", result.getPayload());
            model.addAttribute("pageVo", pageVo);
        } else {
            model.addAttribute("notices", null);
        }
        return "notice/notice";
    }

    @RequestMapping(value = "/write", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getWrite() {
        return "notice/noticeWrite";
    }

    @RequestMapping(value = "/specific", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getSpecific(@RequestParam(value = "index") int index, Model model) {
        ResultTuple<NoticeEntity> result = this.noticeService.getNotice(index);
        model.addAttribute("data", result.getPayload());
        return "notice/noticeSpecific";
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

    @RequestMapping(value="/modify",method=RequestMethod.GET,produces=MediaType.TEXT_HTML_VALUE)
    public String getModify(Model model, @RequestParam(value="index") int index){
        ResultTuple<NoticeEntity> notice = this.noticeService.getNotice(index);
        model.addAttribute("notice", notice.getPayload());
        return "notice/noticeModify";
    }
}
