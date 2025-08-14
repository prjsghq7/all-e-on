package com.dev.alleon.results.welfare;

public enum WelfareApiResult {
    SUCCESS,                                            // 0 정상 조회

    HTTP_ERROR,                                         // 04 HTTP_ERROR
    INVALID_REQUEST_PARAMETER_ERROR,                    // 10 잘못된 요청 파라메터 에러
    NO_OPENAPI_SERVICE_ERROR,                           // 12 해당 오픈API서비스가 없거나 폐기됨
    SERVICE_ACCESS_DENIED_ERROR,                        // 20 서비스 접근거부
    LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR,   // 22 서비스 요청제한횟수 초과에러
    SERVICE_KEY_IS_NOT_REGISTERED_ERROR,                // 30 등록되지 않은 서비스키
    DEADLINE_HAS_EXPIRED_ERROR,                         // 31 활용기간 만료
    NO_DATA_FOUND,                                      // 40 제공 정보 없음
    UNKNOWN_ERROR,                                      // 99 기타에러
}
