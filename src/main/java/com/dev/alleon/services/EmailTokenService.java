package com.dev.alleon.services;

import com.dev.alleon.entities.EmailTokenEntity;
import com.dev.alleon.mappers.EmailTokenMapper;
import com.dev.alleon.regexes.EmailTokenRegex;
import com.dev.alleon.regexes.UserRegex;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailTokenService {
    private final EmailTokenMapper emailTokenMapper;

    @Autowired
    public EmailTokenService(EmailTokenMapper emailTokenMapper) {
        this.emailTokenMapper = emailTokenMapper;
    }

    public Result verityEmailToken(EmailTokenEntity emailToken) {
        if (!UserRegex.email.matches(emailToken.getEmail()) ||
                !EmailTokenRegex.emailCode.matches(emailToken.getCode())||
        !EmailTokenRegex.emailSalt.matches(emailToken.getSalt())) {
            return CommonResult.FAILURE;
        }
        EmailTokenEntity dbEmailToken = this.emailTokenMapper.selectByEmailAndCodeAndSalt(emailToken.getEmail(), emailToken.getCode(), emailToken.getSalt());
        if (dbEmailToken == null) {
            return CommonResult.FAILURE;
        }
        if (!emailToken.getUserAgent().equals(dbEmailToken.getUserAgent()) || dbEmailToken.isUsed()) {
            return CommonResult.FAILURE;
        }
        if (dbEmailToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        dbEmailToken.setUsed(true);
        return this.emailTokenMapper.update(dbEmailToken) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }
}
