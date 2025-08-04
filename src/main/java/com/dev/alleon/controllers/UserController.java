package com.dev.alleon.controllers;

import com.dev.alleon.entities.ContactMvnoEntity;
import com.dev.alleon.entities.EmailTokenEntity;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.results.Result;
import com.dev.alleon.services.EmailTokenService;
import com.dev.alleon.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

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



    @RequestMapping(value = "/login", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogin() {
        return "user/login";
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
        response.put("result", result.toString());
        return response.toString();
    }

    @RequestMapping(value = "/register", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getRegister(HttpSession session, Model model) {
        UserEntity user = (UserEntity) session.getAttribute("signedUser");
        ContactMvnoEntity[] contactMvnos = userService.getContactMvnos();
        model.addAttribute("contactMvnos", contactMvnos);
        return "user/register";
    }
}
