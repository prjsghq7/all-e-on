package com.dev.alleon.controllers;

import com.dev.alleon.entities.CodeEntity;
import com.dev.alleon.entities.ContactMvnoEntity;
import com.dev.alleon.entities.EmailTokenEntity;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.oauth.CustomOAuth2User;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

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
    public String getRegister(HttpSession session, Model model) {
        UserEntity user = (UserEntity) session.getAttribute("signedUser");
        ContactMvnoEntity[] contactMvnos = userService.getContactMvnos();
        model.addAttribute("contactMvnos", contactMvnos);
        model.addAttribute("houseCode", userService.getCode(CodeEntity.CodeType.trgterIndvdlArray));
        model.addAttribute("interestCode", userService.getCode(CodeEntity.CodeType.IntrsThemaArray));
        model.addAttribute("lifeCode", userService.getCode(CodeEntity.CodeType.lifeArray));
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

    @RequestMapping(value = "/recover", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getRecover(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, Model model) {
        if (signedUser != null) {
            return "redirect:/";
        }
        ContactMvnoEntity[] contactMvnos = userService.getContactMvnos();
        model.addAttribute("contactMvnos", contactMvnos);
        return "user/recover";
    }

    @RequestMapping(value = "/recover-password-email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRecoverPasswordEmail(@RequestParam(value = "email") String email,
                                           HttpServletRequest request) throws MessagingException {
        String userAgent = request.getHeader("User-Agent");
        ResultTuple<EmailTokenEntity> result = this.userService.sendRecoverPasswordEmail(email, userAgent);
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().toStringLower());
        if (result.getResult() == CommonResult.SUCCESS) {
            response.put("salt", result.getPayload().getSalt());
        }
        return response.toString();
    }

    @RequestMapping(value = "/recover-password-email", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchRecoverPasswordEmail(EmailTokenEntity emailToken,
                                            HttpServletRequest request) {
        emailToken.setUserAgent(request.getHeader("User-Agent"));
        Result result = this.emailTokenService.verityEmailToken(emailToken);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/recover-password", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRecoverPassword(EmailTokenEntity emailToken,
                                      HttpServletRequest request,
                                      @RequestParam(value = "password", required = false) String password) {
        emailToken.setUserAgent(request.getHeader("User-Agent"));
        Result result = this.userService.recoverPassword(emailToken, password);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        System.out.println(response);
        System.out.println(result);
        return response.toString();
    }

    @RequestMapping(value = "/recover-email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRecoverEmail(UserEntity user) {
        Result result = this.userService.recoverEmail(user);
        JSONObject response = new JSONObject();
        response.put("result", result.toString().toLowerCase());
        if (result == CommonResult.SUCCESS
                || result == CommonResult.FAILURE_SUSPENDED) {
            response.put("email", user.getEmail());
        }
        return response.toString();
    }

    @RequestMapping(value = "/info", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getInfo(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, Model model) {
        if (signedUser == null || signedUser.getActiveState() > 2) {
            return "redirect:/user/login";
        }
        if (signedUser.getProfile() != null && signedUser.getProfile().length > 0) {
            String base64Image = "data:image/png;base64," +
                    Base64.getEncoder().encodeToString(signedUser.getProfile());
            model.addAttribute("profile", base64Image);
        } else {
            model.addAttribute("profile", null);
        }
        model.addAttribute("signedUser", signedUser);
        return "user/info";
    }

    @RequestMapping(value = "/profile", method = RequestMethod.POST, produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE})
    public String uploadProfile(@RequestParam("image") MultipartFile file,
                                @SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                HttpSession session) throws IOException {
        if (signedUser == null) {
            return "redirect:/user/login";
        }
        if (!file.isEmpty()) {
            if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                return "redirect:/user/mypage";
            }
            byte[] bytes = file.getBytes();
            userService.updateProfile(signedUser.getIndex(), bytes);
            signedUser.setProfile(bytes);
            session.setAttribute("signedUser", signedUser);
        }
        return "redirect:/user/login";
    }

    @RequestMapping(value = "/modify", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getModify(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, String code, Model model) {
        if (signedUser == null || signedUser.getActiveState() > 2) {
            return "redirect:/user/login";
        }
        model.addAttribute("user", signedUser);
        ContactMvnoEntity[] contactMvnos = userService.getContactMvnos();
        model.addAttribute("contactMvnos", contactMvnos);
        model.addAttribute("houseCode", userService.getCode(CodeEntity.CodeType.trgterIndvdlArray));
        model.addAttribute("interestCode", userService.getCode(CodeEntity.CodeType.IntrsThemaArray));
        model.addAttribute("lifeCode", userService.getCode(CodeEntity.CodeType.lifeArray));
        System.out.println(signedUser.getHouseholdTypeCode());

        return "user/modify";
    }

    @RequestMapping(value = "/modify", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchModify(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, UserEntity user) {
        Result result = userService.modify(user, signedUser);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/oauth", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getOauth(HttpSession session, Model model) {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) session.getAttribute("oauthUser");
        if (oAuth2User == null) {
            return "redirect:/user/login";
        }
        ContactMvnoEntity[] contactMvnos = userService.getContactMvnos();
        model.addAttribute("houseCode", userService.getCode(CodeEntity.CodeType.trgterIndvdlArray));
        model.addAttribute("interestCode", userService.getCode(CodeEntity.CodeType.IntrsThemaArray));
        model.addAttribute("lifeCode", userService.getCode(CodeEntity.CodeType.lifeArray));
        model.addAttribute("contactMvnos", contactMvnos);
        model.addAttribute("oauthUser", oAuth2User);
        return "user/oauth";
    }

    @RequestMapping(value = "/oauth/register", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postOauthRegister(HttpSession session, UserEntity userEntity) {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) session.getAttribute("oauthUser");
        Result result = this.userService.oauthRegister(oAuth2User, userEntity);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/remove", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getRemove(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, Model model) {
        if (signedUser == null || signedUser.getActiveState() > 2) {
            return "redirect:/user/login";
        }
        model.addAttribute("email", signedUser.getEmail());
        return "user/removeAccount";
    }

    @RequestMapping(value = "/remove", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteRemoveAccount(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser, EmailTokenEntity emailToken, HttpServletRequest request, HttpSession session) {
        emailToken.setUserAgent(request.getHeader("User-Agent"));
        Result result = this.userService.removeAccount(signedUser, emailToken);
        if (result == CommonResult.SUCCESS) {
            session.setAttribute("signedUser", null);
        }
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/remove-email", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchRemoveAccountEmail(EmailTokenEntity emailToken,
                                          HttpServletRequest request) {
        emailToken.setUserAgent(request.getHeader("User-Agent"));
        Result result = this.emailTokenService.verityEmailToken(emailToken);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/remove-email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRemoveAccountEmail(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                         @RequestParam(value = "email") String email,
                                         HttpServletRequest request) throws MessagingException {
        String userAgent = request.getHeader("User-Agent");
        ResultTuple<EmailTokenEntity> result = this.userService.sendRemoveAccountEmail(signedUser, email, userAgent);
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().toStringLower());
        if (result.getResult() == CommonResult.SUCCESS) {
            response.put("salt", result.getPayload().getSalt());
        }
        return response.toString();
    }
}
