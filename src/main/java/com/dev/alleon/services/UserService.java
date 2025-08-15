package com.dev.alleon.services;

import com.dev.alleon.entities.CodeEntity;
import com.dev.alleon.entities.ContactMvnoEntity;
import com.dev.alleon.entities.EmailTokenEntity;
import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.mappers.ContactMvnoMapper;
import com.dev.alleon.mappers.EmailTokenMapper;
import com.dev.alleon.mappers.UserMapper;
import com.dev.alleon.mappers.welfare.HouseholdTypeMapper;
import com.dev.alleon.mappers.welfare.InterestSubMapper;
import com.dev.alleon.mappers.welfare.LifeCycleMapper;
import com.dev.alleon.oauth.CustomOAuth2User;
import com.dev.alleon.regexes.EmailTokenRegex;
import com.dev.alleon.regexes.UserRegex;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import com.dev.alleon.results.ResultTuple;
import com.dev.alleon.results.user.ModifyResult;
import com.dev.alleon.results.user.RegisterResult;
import com.dev.alleon.results.user.RemoveAccountResult;
import com.dev.alleon.utils.BCryptUtils;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    public UserService(UserMapper userMapper, EmailTokenMapper emailTokenMapper, ContactMvnoMapper contactMvnoMapper, HouseholdTypeMapper householdTypeMapper, InterestSubMapper interestSubMapper, LifeCycleMapper lifeCycleMapper, JavaMailSender javaMailSender, SpringTemplateEngine springTemplateEngine) {
        this.userMapper = userMapper;
        this.emailTokenMapper = emailTokenMapper;
        this.contactMvnoMapper = contactMvnoMapper;
        this.householdTypeMapper = householdTypeMapper;
        this.interestSubMapper = interestSubMapper;
        this.lifeCycleMapper = lifeCycleMapper;
        this.javaMailSender = javaMailSender;
        this.springTemplateEngine = springTemplateEngine;
    }

    @Transactional
    public void updateProfile(int userId, byte[] profileBytes) {
        userMapper.updateProfile(userId, profileBytes);
    }

    private static EmailTokenEntity generateEmailToken(String email, String userAgent, int expMin) {
        String code = RandomStringUtils.randomNumeric(6);   // "000000" ~ "999999"
        String salt = RandomStringUtils.randomAlphanumeric(128); // a-z A~Z 0~9

        return UserService.generateEmailToken(email, userAgent, code, salt, expMin);
    }
    private static EmailTokenEntity generateEmailToken(String email, String userAgent, String code, String salt, int expMin) {
        EmailTokenEntity emailToken = new EmailTokenEntity();
        emailToken.setEmail(email);
        emailToken.setCode(code);
        emailToken.setSalt(salt);
        emailToken.setUserAgent(userAgent);
        emailToken.setUsed(false);
        emailToken.setCreatedAt(LocalDateTime.now());
        emailToken.setExpiresAt(LocalDateTime.now().plusMinutes(expMin));
        return emailToken;
    }

    private final UserMapper userMapper;
    private final EmailTokenMapper emailTokenMapper;
    private final ContactMvnoMapper contactMvnoMapper;
    private final HouseholdTypeMapper householdTypeMapper;
    private final InterestSubMapper interestSubMapper;
    private final LifeCycleMapper lifeCycleMapper;
    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine springTemplateEngine;

    public ResultTuple<EmailTokenEntity> sendRemoveAccountEmail(UserEntity signedUser, String email, String userAgent) throws MessagingException {
        if (signedUser.getActiveState() > 2) {
            return ResultTuple.<EmailTokenEntity>builder().result(CommonResult.FAILURE_SESSION_EXPIRED).build();
        }

        if (!UserRegex.email.matches(email) || userAgent == null) {
            return ResultTuple.<EmailTokenEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }

        if (!signedUser.getEmail().equals(email)) {
            return ResultTuple.<EmailTokenEntity>builder()
                    .result(RemoveAccountResult.FAILURE_NO_PERMISSION)
                    .build();
        }

        String code = RandomStringUtils.randomNumeric(6);   // "000000" ~ "999999"
        String salt = RandomStringUtils.randomAlphanumeric(128); // a-z A~Z 0~9
        EmailTokenEntity emailToken = UserService.generateEmailToken(email, userAgent, code, salt, 10);

        if (this.emailTokenMapper.insert(emailToken) < 1) {
            return ResultTuple.<EmailTokenEntity>builder().result(CommonResult.FAILURE).build();
        }

        //이메일 전송
        Context context = new Context();
        // thymeleaf 에서 사용할 데이터 입력
        context.setVariable("code", emailToken.getCode());
        // 보낼 html 파일 경로
        String mailText = this.springTemplateEngine.process("user/removeAccountEmail", context);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);
        mimeMessageHelper.setFrom("rkw2115@gmail.com");
        mimeMessageHelper.setTo(emailToken.getEmail());
        mimeMessageHelper.setSubject("[aeo] 회원탈퇴 인증번호");
        mimeMessageHelper.setText(mailText, true);
        this.javaMailSender.send(mimeMessage);

        return ResultTuple.<EmailTokenEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(emailToken)
                .build();
    }

    public Result removeAccount(UserEntity signedUser, EmailTokenEntity emailToken) {
        // TODO 이즈인밸리드유저 검사해야됨
        if (signedUser.getActiveState() > 2) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }

        if (emailToken == null || !EmailTokenRegex.emailCode.matches(emailToken.getCode()) || !EmailTokenRegex.emailSalt.matches(emailToken.getSalt())) {
            return CommonResult.FAILURE;
        }
        EmailTokenEntity dbEmailToken = this.emailTokenMapper.selectByEmailAndCodeAndSalt(emailToken.getEmail(), emailToken.getCode(), emailToken.getSalt());
        if (dbEmailToken == null
                || !dbEmailToken.isUsed()
                || !dbEmailToken.getUserAgent().equals(emailToken.getUserAgent())) {
            return CommonResult.FAILURE;
        }

        if (!signedUser.getEmail().equals(emailToken.getEmail())) {
            return RemoveAccountResult.FAILURE_NO_PERMISSION;
        }
        signedUser.setActiveState(2);
        signedUser.setModifiedAt(LocalDateTime.now());
        return this.userMapper.update(signedUser) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public Result register(EmailTokenEntity emailToken,
                           UserEntity user) {
        if (user == null) {
            System.out.println("5");
            return CommonResult.FAILURE;
        }
        if (emailToken == null ||
                !EmailTokenRegex.emailCode.matches(emailToken.getCode()) || !EmailTokenRegex.emailSalt.matches(emailToken.getSalt())) {
            System.out.println("4");
            return CommonResult.FAILURE;
        }
        EmailTokenEntity dbEmailToken = this.emailTokenMapper.selectByEmailAndCodeAndSalt(emailToken.getEmail(), emailToken.getCode(), emailToken.getSalt());
        if (dbEmailToken == null ||
                !dbEmailToken.isUsed() ||
                !dbEmailToken.getUserAgent().equals(emailToken.getUserAgent())) {
            System.out.println("3");
            return CommonResult.FAILURE;
        }

        if (!UserRegex._name.matches(user.getName()) || !UserRegex.email.matches(user.getEmail()) || !UserRegex.password.matches(user.getPassword())) {
            System.out.println("2");
            return CommonResult.FAILURE;
        }
        user.setPassword(BCryptUtils.encrypt(user.getPassword()));
        if (!UserRegex.nickname.matches(user.getNickname()) || !UserRegex.birth.matches(user.getBirth().toString()) || !UserRegex.gender.matches(user.getGender()) || !UserRegex.contactSecondRegex.matches(user.getContactSecond()) || !UserRegex.contactThirdRegex.matches(user.getContactThird()) || user.getAddressPostal() == null || user.getAddressPostal().isEmpty() || user.getAddressPrimary() == null || user.getAddressPrimary().isEmpty() || user.getAddressSecondary() == null || user.getAddressSecondary().isEmpty()) {
            System.out.println("1");
            return CommonResult.FAILURE;
        }
        user.setProfile(new byte[0]);
        user.setTermAgreedAt(LocalDateTime.now());
        if (this.userMapper.selectCountByNickname(user.getNickname()) > 0) {
            System.out.println("7");
            return RegisterResult.FAILURE_DUPLICATE_NICKNAME;
        }
        if (this.userMapper.selectCountByContact(user.getContactFirst(), user.getContactSecond(), user.getContactThird()) > 0) {
            System.out.println("6");
            return RegisterResult.FAILURE_DUPLICATE_CONTACT;
        }

        user.setActiveState(1);
        user.setCreatedAt(LocalDateTime.now());
        user.setModifiedAt(LocalDateTime.now());
        user.setProviderType("LOCAL");
        user.setProviderKey(user.getEmail());
        user.setLastLogin(null);

        return this.userMapper.insert(user) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public ContactMvnoEntity[] getContactMvnos() {
        return contactMvnoMapper.selectAll();
    }

    public ResultTuple<EmailTokenEntity> sendRegisterEmail(String email, String userAgent) throws MessagingException {
        if (!UserRegex.email.matches(email) || userAgent == null) {
            return ResultTuple.<EmailTokenEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (this.userMapper.selectUserCountByEmail(email) > 0) {
            return ResultTuple.<EmailTokenEntity>builder()
                    .result(CommonResult.FAILURE_DUPLICATE)
                    .build();
        }
        String code = RandomStringUtils.randomNumeric(6);   // "000000" ~ "999999"
        String salt = RandomStringUtils.randomAlphanumeric(128); // a-z A~Z 0~9
        EmailTokenEntity emailToken = UserService.generateEmailToken(email, userAgent, code, salt, 10);

        if (this.emailTokenMapper.insert(emailToken) < 1) {
            return ResultTuple.<EmailTokenEntity>builder().result(CommonResult.FAILURE).build();
        }

        //이메일 전송
        Context context = new Context();
        // thymeleaf 에서 사용할 데이터 입력
        context.setVariable("code", emailToken.getCode());
        // 보낼 html 파일 경로
        String mailText = this.springTemplateEngine.process("user/registerEmail", context);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);
        mimeMessageHelper.setFrom("rkw2115@gmail.com");
        mimeMessageHelper.setTo(emailToken.getEmail());
        mimeMessageHelper.setSubject("[all-e-on] 회원가입 인증번호");
        mimeMessageHelper.setText(mailText, true);
        this.javaMailSender.send(mimeMessage);

        return ResultTuple.<EmailTokenEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(emailToken)
                .build();
    }

    public List<CodeEntity> getCode(CodeEntity.CodeType codeType) {
        List<CodeEntity> codeEntities = new ArrayList<>();

        switch (codeType) {
            case lifeArray:
                codeEntities = lifeCycleMapper.selectAll();
                break;
            case trgterIndvdlArray:
                codeEntities = householdTypeMapper.selectAll();
                break;
            case IntrsThemaArray:
                codeEntities = interestSubMapper.selectAll();
                break;
        }

        return codeEntities;
    }


    public Result checkNickname(String nickname) {
        if (!UserRegex.nickname.matches(nickname)) {
            return CommonResult.FAILURE;
        }
        return this.userMapper.selectCountByNickname(nickname) > 0 ? CommonResult.FAILURE_DUPLICATE : CommonResult.SUCCESS;
    }

    public Result checkContact(String contactFirst, String contactSecond, String contactThird) {
        if (!UserRegex.contactSecondRegex.matches(contactSecond)
                || !UserRegex.contactThirdRegex.matches(contactThird)) {
            return CommonResult.FAILURE;
        }
        return this.userMapper.selectCountByContact(contactFirst, contactSecond, contactThird) > 0 ? CommonResult.FAILURE_DUPLICATE : CommonResult.SUCCESS;
    }

    public ResultTuple<UserEntity> login(String email, String password, String userAgent) {
        if (!UserRegex.email.matches(email) || !UserRegex.password.matches(password)) {
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }
        UserEntity dbUser = this.userMapper.selectUserByEmail(email);

        if (dbUser.getActiveState() > 2) {
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }
        if (!BCryptUtils.isMatch(password, dbUser.getPassword())) {
            System.out.println("입력된 비밀번호: " + password);
            System.out.println("DB 비밀번호: " + dbUser.getPassword());
            System.out.println("BCrypt 결과: " + BCryptUtils.isMatch(password, dbUser.getPassword()));

            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }

        Result result = updateLoginHistory(dbUser, userAgent);
        return ResultTuple.<UserEntity>builder().result(CommonResult.SUCCESS).payload(dbUser).build();
    }

    public Result updateLoginHistory(UserEntity user, String lastLogin) {
        user.setLastLogin(LocalDateTime.now());
        return this.userMapper.update(user) > 0 ? CommonResult.FAILURE : CommonResult.FAILURE;
    }

    public ResultTuple<EmailTokenEntity> sendRecoverPasswordEmail(String email, String userAgent) throws MessagingException {
        if (!UserRegex.email.matches(email) || userAgent == null) {
            return ResultTuple.<EmailTokenEntity>builder().result(CommonResult.FAILURE).build();
        }
        if (this.userMapper.selectUserCountByEmail(email) == 0) {
            return ResultTuple.<EmailTokenEntity>builder().result(CommonResult.FAILURE_ABSENT).build();
        }
        String code = RandomStringUtils.randomNumeric(6);   // "000000" ~ "999999"
        String salt = RandomStringUtils.randomAlphanumeric(128); // a-z A~Z 0~9
        EmailTokenEntity emailToken = UserService.generateEmailToken(email, userAgent, code, salt, 10);

        if (this.emailTokenMapper.insert(emailToken) < 1) {
            return ResultTuple.<EmailTokenEntity>builder().result(CommonResult.FAILURE).build();
        }
        //이메일 전송
        Context context = new Context();
        // thymeleaf 에서 사용할 데이터 입력
        context.setVariable("code", emailToken.getCode());
        // 보낼 html 파일 경로
        String mailText = this.springTemplateEngine.process("user/recoverEmail", context);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);
        mimeMessageHelper.setFrom("rkw2115@gmail.com");
        mimeMessageHelper.setTo(emailToken.getEmail());
        mimeMessageHelper.setSubject("[all-e-on] 계정 복구(비밀번호 재설정) 인증번호");
        mimeMessageHelper.setText(mailText, true);
        this.javaMailSender.send(mimeMessage);

        return ResultTuple.<EmailTokenEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(emailToken)
                .build();
    }

    public Result recoverPassword(EmailTokenEntity emailToken, String password) {
        if (emailToken == null || !UserRegex.email.matches(emailToken.getEmail()) || !UserRegex.password.matches(password)) {
            System.out.println("1");
            return CommonResult.FAILURE;
        }

        EmailTokenEntity dbEmailToken = this.emailTokenMapper.selectByEmailAndCodeAndSalt(emailToken.getEmail(), emailToken.getCode(), emailToken.getSalt());

        if (dbEmailToken == null || !dbEmailToken.isUsed() || !dbEmailToken.getUserAgent().equals(emailToken.getUserAgent())) {
            System.out.println("2");
            return CommonResult.FAILURE;
        }

        UserEntity user = this.userMapper.selectUserByEmail(emailToken.getEmail());
        if (user == null || user.getActiveState() == 3) {
            System.out.println("3");
            return CommonResult.FAILURE;
        }
        if (user.getActiveState() == 2) {
            System.out.println("4");
            return CommonResult.FAILURE_SUSPENDED;
        }
        user.setPassword(BCryptUtils.encrypt(password));
        user.setModifiedAt(LocalDateTime.now());
        return this.userMapper.update(user) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public Result recoverEmail(UserEntity user) {
        if (user == null
                || !UserRegex._name.matches(user.getName())
                || !UserRegex.birth.matches(user.getBirth().toString())
                || !UserRegex.contactSecondRegex.matches(user.getContactSecond())
                || !UserRegex.contactThirdRegex.matches(user.getContactThird())
                || this.contactMvnoMapper.selectCountByCode(user.getContactMvnoCode()) < 1) {
            return CommonResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectLocalUserByContact(user.getContactMvnoCode(), user.getContactFirst(), user.getContactSecond(), user.getContactThird());
        if (dbUser == null
                || dbUser.getActiveState() == 3
                || !dbUser.getName().equals(user.getName())
                || !dbUser.getBirth().equals(user.getBirth())) {
            return CommonResult.FAILURE_ABSENT;
        }

        user.setEmail(dbUser.getEmail());
        if (dbUser.getActiveState() == 4) {
            return CommonResult.FAILURE_SUSPENDED;
        }

        return CommonResult.SUCCESS;
    }

    public Result modify(UserEntity user, UserEntity signedUser) {
        if (signedUser == null || signedUser.getActiveState() > 2) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (!UserRegex.nickname.matches(user.getNickname())
                || !UserRegex.birth.matches(user.getBirth().toString())
                || !UserRegex.gender.matches(user.getGender())
                || !UserRegex.contactSecondRegex.matches(user.getContactSecond())
                || !UserRegex.contactThirdRegex.matches(user.getContactThird())
                || user.getAddressPostal() == null || user.getAddressPostal().isEmpty()
                || user.getAddressPrimary() == null || user.getAddressPrimary().isEmpty()
                || user.getAddressSecondary() == null || user.getAddressSecondary().isEmpty()) {
            System.out.println("1");
            return CommonResult.FAILURE;
        }
        if (!signedUser.getNickname().equals(user.getNickname())) {
            if (this.userMapper.selectCountByNickname(user.getNickname()) > 0) {
                return ModifyResult.FAILURE_DUPLICATE_NICKNAME;
            }
        }
        if (!signedUser.getContactFirst().equals(user.getContactFirst())
                || !signedUser.getContactSecond().equals(user.getContactSecond())
                || !signedUser.getContactThird().equals(user.getContactThird())) {
            if (this.userMapper.selectCountByContact(user.getContactFirst(), user.getContactSecond(), user.getContactThird()) > 0) {
                return ModifyResult.FAILURE_DUPLICATE_CONTACT;
            }
        }
        signedUser.setNickname(user.getNickname());
        signedUser.setBirth(user.getBirth());
        signedUser.setGender(user.getGender());
        signedUser.setContactMvnoCode(user.getContactMvnoCode());
        signedUser.setContactFirst(user.getContactFirst());
        signedUser.setContactSecond(user.getContactSecond());
        signedUser.setContactThird(user.getContactThird());
        signedUser.setAddressPostal(user.getAddressPostal());
        signedUser.setAddressPrimary(user.getAddressPrimary());
        signedUser.setAddressSecondary(user.getAddressSecondary());
        signedUser.setLifeCycleCode(user.getLifeCycleCode());
        signedUser.setHouseholdTypeCode(user.getHouseholdTypeCode());
        signedUser.setInterestSubCode(user.getInterestSubCode());
        signedUser.setModifiedAt(LocalDateTime.now());

        return userMapper.update(signedUser) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;

    }

    public Result oauthRegister(CustomOAuth2User customOAuth2User, UserEntity user) {
        String contactFrist = customOAuth2User.getMobile().split("-")[0];
        String contactSecond = customOAuth2User.getMobile().split("-")[1];
        String contactThird = customOAuth2User.getMobile().split("-")[2];

        if (customOAuth2User == null || user == null) {
            return CommonResult.FAILURE;
        }
        if (this.userMapper.selectUserCountByEmail(customOAuth2User.getEmail()) > 0) {
            return CommonResult.FAILURE_DUPLICATE;
        }
        ;
        user.setName(customOAuth2User.getName());
        user.setEmail(customOAuth2User.getEmail());
        user.setGender(customOAuth2User.getGender());
        user.setPassword(BCryptUtils.encrypt(customOAuth2User.getEmail()));
        user.setProviderKey(customOAuth2User.getProviderKey());
        user.setProviderType(customOAuth2User.getProviderType());
        user.setBirth(customOAuth2User.getBirthyear() + "-" + customOAuth2User.getBirthday());
        user.setContactFirst(contactFrist);
        user.setContactSecond(contactSecond);
        user.setContactThird(contactThird);
        user.setCreatedAt(LocalDateTime.now());
        user.setTermAgreedAt(LocalDateTime.now());
        user.setActiveState(1);
        user.setProfile(new byte[0]);
        return this.userMapper.insert(user) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }




}