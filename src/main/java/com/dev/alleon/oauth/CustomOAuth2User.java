package com.dev.alleon.oauth;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {
    private final Map<String, Object> attributes;
    private final String providerType;
    private final String providerKey;

    public CustomOAuth2User(Map<String, Object> attributes, String providerType, String providerKey) {
        this.attributes = attributes;
        this.providerType = providerType;
        this.providerKey = providerKey;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        Map<String, Object> response = getResponse();
        if (response == null) return null;

        Object name = response.get("name");
        if (name == null || name.toString().isBlank()) {
            name = response.get("nickname");
        }
        return name != null ? name.toString() : null;
    }

    public String getEmail() {
        Map<String, Object> response = getResponse();
        if (response == null) return null;

        Object email = response.get("email");
        return email != null ? email.toString() : null;
    }

    public String getBirthday() {
        Map<String, Object> response = getResponse();
        if (response == null) return null;

        Object birthday = response.get("birthday");
        return birthday != null ? birthday.toString() : null;
    }

    public String getBirthyear() {
        Map<String, Object> response = getResponse();
        if (response == null) return null;

        Object birthyear = response.get("birthyear");
        return birthyear != null ? birthyear.toString() : null;
    }

    public String getProfileImage() {
        Map<String, Object> response = getResponse();
        if (response == null) return null;

        Object image = response.get("profile_image");
        return image != null ? image.toString() : null;
    }

    public String getGender() {
        Map<String, Object> response = getResponse();
        if (response == null) {
            return null;
        }
        Object gender = response.get("gender");
        return gender != null ? gender.toString() : null;
    }

    public String getMobile() {
        Map<String, Object> response = getResponse();
        if (response == null) return null;

        Object mobile = response.get("mobile");
        return mobile != null ? mobile.toString() : null;
    }

    public String getProviderType() {
        return providerType;
    }
    public String getProviderKey(){
        return providerKey;
    }

    // 🔧 공통 response 추출 로직
    @SuppressWarnings("unchecked")
    private Map<String, Object> getResponse() {
        return (Map<String, Object>) attributes.get("response");
    }
}
