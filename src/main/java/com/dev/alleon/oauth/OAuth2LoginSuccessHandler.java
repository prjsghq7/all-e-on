package com.dev.alleon.oauth;

import com.dev.alleon.mappers.UserMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserMapper userMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        System.out.println("로그인 성공: " + oAuth2User.getAttributes());
        System.out.println("providerKey: " + oAuth2User.getProviderKey());
        HttpSession session = request.getSession();
        session.setAttribute("oauthUser", oAuth2User);
        if (this.userMapper.selectUserCountByProviderTypeAndProviderKey(oAuth2User.getProviderType(), oAuth2User.getProviderKey()) > 0) {
            System.out.println("존재");
            session.setAttribute("signedUser", oAuth2User);
            response.sendRedirect("/home");
        } else if (this.userMapper.selectUserCountByEmail(oAuth2User.getEmail()) > 0) {
            System.out.println("존재2");
            response.sendRedirect("/home");
        } else {
            response.sendRedirect("/user/oauth");
        }
    }

}
