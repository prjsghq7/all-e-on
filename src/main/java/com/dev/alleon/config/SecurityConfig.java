package com.dev.alleon.config;

import com.dev.alleon.oauth.CustomOAuth2UserService;
import com.dev.alleon.oauth.OAuth2LoginSuccessHandler;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityConfig {
    @Autowired
    private OAuth2LoginSuccessHandler successHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
//                .csrf(csrf -> csrf.disable()
//                )
                .oauth2Login(
                        oauth -> oauth
                                .loginPage("/user/login")
                                .successHandler(successHandler)
                                .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService()))
                                .authorizationEndpoint(endpoint -> endpoint
                                        .authorizationRequestRepository(new HttpSessionOAuth2AuthorizationRequestRepository())
                                )
                );

        return http.build();
    }
    @Bean
    public CustomOAuth2UserService oAuth2UserService(){
        return new CustomOAuth2UserService();
    }
}
