package com.dev.alleon.results.user;

import com.dev.alleon.results.Result;

public enum RegisterResult implements Result {
    FAILURE_OAUTH_SESSION_EXPIRED,
    FAILURE_DUPLICATE_NICKNAME,
    FAILURE_DUPLICATE_CONTACT
}
