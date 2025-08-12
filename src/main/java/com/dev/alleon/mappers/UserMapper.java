package com.dev.alleon.mappers;

import com.dev.alleon.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.security.core.parameters.P;

@Mapper
public interface UserMapper {
    int insert(@Param("user") UserEntity user);

    int update(@Param("user") UserEntity user);

    UserEntity selectLocalUserByContact(@Param(value = "contactMvno") String contactMvno,
                                        @Param(value = "contactFirst") String contactFirst,
                                        @Param(value = "contactSecond") String contactSecond,
                                        @Param(value = "contactThird") String contactThird);

    UserEntity selectUserByEmail(@Param(value = "email") String email);

    UserEntity selectUserByProviderKey(@Param("providerType") String provider, @Param("providerId") String providerId);

    int selectCountByEmail(@Param(value = "email") String email);

    int selectCountByNickname(@Param(value = "nickname") String nickname);

    int selectCountByContact(@Param(value = "contactFirst") String contactFirst,
                             @Param(value = "contactSecond") String contactSecond,
                             @Param(value = "contactThird") String contactThird);

    int selectUserCountByEmail(@Param(value = "email") String email);

    int selectUserCountByProviderTypeAndProviderKey(@Param(value = "providerType") String providerType, @Param(value = "providerKey") String providerKey);


}
