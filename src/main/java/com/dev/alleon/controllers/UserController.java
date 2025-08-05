package com.dev.alleon.controllers;

import com.dev.alleon.entities.CodeEntity;
import com.dev.alleon.entities.ContactMvnoEntity;
import com.dev.alleon.entities.EmailTokenEntity;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import com.dev.alleon.results.ResultTuple;
import com.dev.alleon.services.EmailTokenService;
import com.dev.alleon.services.UserService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping(value = "/user")
public class UserController {
    private final UserService userService;
    private final EmailTokenService emailTokenService;

    @Autowired
    public UserController(UserService userService, EmailTokenService emailTokenService) {
        this.userService = userService;
        this.emailTokenService = emailTokenService;
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRegister(EmailTokenEntity emailToken,
                               UserEntity userEntity,
                               HttpServletRequest request,
                               HttpSession session) {
        emailToken.setUserAgent(request.getHeader("User-Agent"));
        Result result = this.userService.register(emailToken, userEntity);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/register", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getRegister(HttpSession session, String code, Model model) {
        UserEntity user = (UserEntity) session.getAttribute("signedUser");
        ContactMvnoEntity[] contactMvnos = userService.getContactMvnos();
        List<CodeEntity> houseCode = userService.getHouseCode(code);
        List<CodeEntity> interestCode = userService.getInterestCode(code);
        List<CodeEntity> lifeCode = userService.getLifeCode(code);
        model.addAttribute("contactMvnos", contactMvnos);
        model.addAttribute("houseCode", houseCode);
        model.addAttribute("interestCode", interestCode);
        model.addAttribute("lifeCode", lifeCode);
        return "user/register";
    }

    @RequestMapping(value = "/register-email", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchRegisterEmail(EmailTokenEntity emailToken,
                                     HttpServletRequest request) {
        emailToken.setUserAgent(request.getHeader("User-Agent"));
        Result result = this.emailTokenService.verityEmailToken(emailToken);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/register-email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRegisterEmail(@RequestParam(value = "email") String email,
                                    HttpServletRequest request) throws MessagingException {
        String userAgent = request.getHeader("User-Agent");
        ResultTuple<EmailTokenEntity> result = this.userService.sendRegisterEmail(email, userAgent);
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().toStringLower());
        if (result.getResult() == CommonResult.SUCCESS) {
            response.put("salt", result.getPayload().getSalt());
        }
        return response.toString();
    }

    @RequestMapping(value = "/nickname-check", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postNicknameCheck(@RequestParam(value = "nickname") String nickname) {
        Result result = this.userService.checkNickname(nickname);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/contact-check", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postContactCheck(@RequestParam(value = "contactFirst") String contactFirst, @RequestParam(value = "contactSecond") String contactSecond, @RequestParam(value = "contactThird") String contactThird) {
        Result result = this.userService.checkContact(contactFirst, contactSecond, contactThird);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "logout", method = {RequestMethod.GET, RequestMethod.POST}, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogout(HttpSession session) {
        session.setAttribute("signedUser", null);
        return "redirect:/user/login";
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogin(@SessionAttribute(value = "signedUser", required = false) UserEntity user) {
        return "user/login";
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postLogin(@RequestParam(value = "email") String email,
                            @RequestParam(value = "password") String password,
                            HttpSession session,
                            HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        ResultTuple<UserEntity> result = userService.login(email, password, userAgent);
        if (result.getResult() == CommonResult.SUCCESS) {
            session.setAttribute("signedUser", result.getPayload());
        }
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().toStringLower());
        return response.toString();
    }
}
