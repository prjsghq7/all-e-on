package com.dev.alleon.utils;

import lombok.experimental.UtilityClass;
import org.mindrot.jbcrypt.BCrypt;

@UtilityClass
public class BCryptUtils {
    public String encrypt(String password){
        return BCrypt.hashpw(password,BCrypt.gensalt(
        ));
    }
    public boolean isMatch(String password, String hashed){
        return BCrypt.checkpw(password, hashed);
    }

}
