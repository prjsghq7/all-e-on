package com.dev.alleon.entities;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class UserEntity {
    private int index;
    private String name;
    private Byte[] profile;
    private String email;
    private String password;
    private String contactMvnoCode;
    private String contactFirst;
    private String contactSecond;
    private String contactThird;
    private String nickname;
    private String birth;
    private String gender;
    private String providerKey;
    private String providerType;
    private String addressPostal;
    private String addressPrimary;
    private String addressSecondary;
    private int activeState;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private LocalDateTime lastLogin;
    private String lifeCycleCode;
    private String householdTypeCode;
    private String interestSubCode;
}
