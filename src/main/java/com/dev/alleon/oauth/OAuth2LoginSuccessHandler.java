package com.dev.alleon.oauth;

import com.dev.alleon.entities.UserEntity;
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
        UserEntity user = this.userMapper.selectUserByProviderTypeAndProviderKey(oAuth2User.getProviderType(), oAuth2User.getProviderKey());
        if (user!=null && user.getActiveState()<=1) {
            session.setAttribute("signedUser", user);
            response.sendRedirect("/home");
        } else if (this.userMapper.selectUserCountByEmail(oAuth2User.getEmail()) > 0) {
            System.out.println("존재2");
            response.sendRedirect("/home");
        } else {
            response.sendRedirect("/user/oauth");
        }
    }

}
