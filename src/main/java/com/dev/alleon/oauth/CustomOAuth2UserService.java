package com.dev.alleon.oauth;


import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.mappers.UserMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private HttpSession session;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String providerType = userRequest.getClientRegistration().getRegistrationId().toUpperCase();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String providerKey = null;
        String email = null;
        String nickname = null;
        byte[] profile = new byte[0];
        String imageUrl = null;
        String mobile;


        // ✅ Naver
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
//        System.out.println(response.get("birthyear"));
//        System.out.println(response.get("birthday"));
//        System.out.println(response.get("mobile"));
//        System.out.println(providerType);
//        System.out.println(response.get("nickname"));
//        System.out.println(response.get("name"));
//        System.out.println(response.get("email"));
//        System.out.println(response.get("gender"));
//        providerKey = (String) response.get("id");
//        email = (String) response.get("email");
//        nickname = (String) response.get("nickname");
//        String profileImageUrl = (String) response.get("profile_image");
//        profile = downloadImageAsBytes(profileImageUrl);
//        imageUrl = profileImageUrl;

        // ✅ 필수 정보 보정
        if (email == null || email.isBlank()) {
            email = providerType.toLowerCase() + "_" + providerKey + "@oauth.com";
        }
        if (nickname == null || nickname.isBlank()) {
            nickname = "user_" + System.currentTimeMillis();
        }
        return new CustomOAuth2User(attributes, providerType);

    }

    // ✅ 이미지 URL을 byte[]로 다운로드
    private byte[] downloadImageAsBytes(String imageUrl) {
        try (InputStream in = new URL(imageUrl).openStream()) {
            return in.readAllBytes();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
}
