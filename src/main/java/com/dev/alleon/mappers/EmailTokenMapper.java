package com.dev.alleon.mappers;

import com.dev.alleon.entities.EmailTokenEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmailTokenMapper {
    int insert(@Param(value = "emailToken") EmailTokenEntity emailToken);

    EmailTokenEntity selectByEmailAndCodeAndSalt(@Param(value = "email") String email,
                                                 @Param(value = "code") String code,
                                                 @Param(value = "salt") String salt);

    int update(@Param(value = "emailToken") EmailTokenEntity emailToken);
}
