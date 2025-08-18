package com.dev.alleon.results;

public enum CommonResult implements Result {
    FAILURE,
    FAILURE_ABSENT,         //없음
    FAILURE_DUPLICATE,      //중복
    FAILURE_SESSION_EXPIRED,      //로그인 필요 | 권한 없음
    FAILURE_SUSPENDED,      //정지 상태
    FAILURE_DOESNT_EXIST,
    FAILURE_NOT_SAME, //user의 index와 article의 userindex가 다를경우
    FAILURE_DUPLICATE_CONTACT,
    SUCCESS
}
