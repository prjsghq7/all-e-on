package com.dev.alleon.results.user;

import com.dev.alleon.results.Result;

public enum ModifyResult implements Result {
    FAILURE_NO_PERMISSION,
    FAILURE_DUPLICATE_NICKNAME,
    FAILURE_DUPLICATE_CONTACT
}
