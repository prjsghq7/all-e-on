
const $registerForm = document.getElementById('registerForm');
const $nicknameLabel = $registerForm['nickname'].closest('[data-aeo-object="label"]');
const $birthLabel = $registerForm['birth'].closest('[data-aeo-object="label"]');
const $contactLabel = $registerForm['contactSecond'].closest('[data-aeo-object="label"]');
const $addressLabel = $registerForm['addressPostal'].closest('[data-aeo-object="label"]');
const $termLabel = $registerForm['agreeServiceTerm'].closest('[data-aeo-object="label"]');
const $privacyLabel = $registerForm['agreePrivacy'].closest('[data-aeo-object="label"]');
const submitBtn = $registerForm.querySelector(':scope > .button-container > .register');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
$registerForm['nicknameCheckButton'].addEventListener('click', () => {
    $nicknameLabel.setInValid(false);
    if ($registerForm['nickname'].validity.valueMissing) {
        $nicknameLabel.setInValid(true, '닉네임을 입력해 주세요.');
        $registerForm['nickname'].focus();
    } else if (!$registerForm['nickname'].validity.valid) {
        $nicknameLabel.setInValid(true, '올바른 닉네임을 입력해주세요.');
        $registerForm['nickname'].focus();
    }
    if ($nicknameLabel.isInValid()) {
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('nickname', $registerForm['nickname'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('오류', '알 수 없는 이유로 닉네임을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'failure_duplicate':
                dialog.showSimpleOk('오류', '이미 사용중인 닉네임입니다. 다른 닉네임을 사용해주시기 바랍니다.');
                $registerForm['nickname'].focus();
                break;
            case 'success':
                dialog.show({
                    title: '닉네임 확인',
                    content: `사용할 수 있는 닉네임입니다.\n이 닉네임을 사용하시겠습니까?`,
                    buttons: [
                        {
                            caption: '확인',
                            color: 'blue',
                            onClickCallback: ($modal) => {
                                $registerForm['nickname'].setDisabled(true);
                                $registerForm['nicknameCheckButton'].setDisabled(true);
                                dialog.hide($modal);
                            }
                        },
                        {
                            caption: '취소',
                            color: 'gray',
                            onClickCallback: (m) => dialog.hide(m)
                        }
                    ]
                });
                break;
            default:
                dialog.showSimpleOk('오류', '알 수 없는 이유로 닉네임 인증을 할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }

    };
    xhr.open('POST', '/user/nickname-check');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if ($registerForm['nickname'].validity.valueMissing) {
        $nicknameLabel.setInValid(true, '닉네임을 입력해 주세요.');
        return;
    }
    if (!$registerForm['nickname'].validity.valid) {
        $nicknameLabel.setInValid(true, '올바른 닉네임을 입력해 주세요.');
        return;
    }

    const birthDate = new Date($registerForm['birth'].value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if ($registerForm['birth'].validity.valueMissing) {
        $birthLabel.setInValid(true, '생년월일을 입력해 주세요.');
        return;
    }
    if (!$registerForm['birth'].validity.valid) {
        $birthLabel.setInValid(true, '올바른 날짜를 입력해 주세요.');
        return;
    }
    if (birthDate > today) {
        $birthLabel.setInValid(true, '생년월일은 미래일 수 없습니다.');
        return;
    }

    if ($registerForm['contactMvno'].value === '-1') {
        $contactLabel.setInValid(true, '통신사를 선택해 주세요.');
        return;
    }
    if ($registerForm['addressPostal'].value.trim() === '' || $registerForm['addressPrimary'].value.trim() === '') {
        $addressLabel.setInValid(true, '주소 찾기 버튼을 통해 주소를 입력해 주세요.');
        return;
    }
    if ($registerForm['addressSecondary'].validity.valueMissing) {
        $addressLabel.setInValid(true, '상세 주소를 입력해 주세요.');
        return;
    }

    if (!$registerForm['agreeServiceTerm'].checked) {
        $termLabel.setInValid(true, '서비스 이용약관에 동의해 주세요.');
        return;
    }
    if (!$registerForm['agreePrivacy'].checked) {
        $privacyLabel.setInValid(true, '개인정보 수집 및 이용 동의 약관에 동의해 주세요.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('nickname', $registerForm['nickname'].value);
    formData.append('contactMvnoCode', $registerForm['contactMvno'].value);
    formData.append('addressPostal', $registerForm['addressPostal'].value);
    formData.append('addressPrimary', $registerForm['addressPrimary'].value);
    formData.append('addressSecondary', $registerForm['addressSecondary'].value);
    formData.append('lifeCycleCode', $registerForm['lifeCode'].value);
    formData.append('householdTypeCode', $registerForm['houseCode'].value);
    formData.append('interestSubCode', $registerForm['interestCode'].value);


    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('오류', '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        const res = JSON.parse(xhr.responseText);
        if (res.result === 'failure_duplicate_email') {
            dialog.showSimpleOk('오류', '입력하신 이메일은 이미 사용중인 이메일입니다.');
            return;
        }
        if (res.result === 'failure_duplicate_nickname') {
            dialog.showSimpleOk('오류', '입력하신 닉네임은 이미 사용중입니다.');
            return;
        }
        if (res.result === 'failure_duplicate_contact') {
            dialog.showSimpleOk('오류', '입력하신 연락처는 이미 사용중입니다.');
            return;
        }
        if (res.result === 'success') {
            dialog.showSimpleOk('회원가입', '회원가입이 완료되었습니다', () => {
                location.href = "/user/login";
            });
            return;
        }
        dialog.showSimpleOk('오류', '알 수 없는 이유로 회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
    };
    xhr.open('POST', '/user/oauth/register');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});
$registerForm['addressFindButton'].addEventListener('click', () => {
    const $addressFindDialog = document.getElementById('addressFindDialog');
    const $modal = $addressFindDialog.querySelector(':scope > .modal');
    $addressFindDialog.onclick = () => {
        $addressFindDialog.setVisible(false);
    }
    new daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete: (data) => {
            $registerForm['addressPostal'].value = data['zonecode'];
            $registerForm['addressPrimary'].value = data['roadAddress'];
            $registerForm['addressSecondary'].focus()
            $registerForm['addressSecondary'].select();
            $addressFindDialog.setVisible(false);
        }
    }).embed($modal);
    $addressFindDialog.setVisible(true);
});
