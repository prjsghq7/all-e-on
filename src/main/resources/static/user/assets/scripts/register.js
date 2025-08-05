const $registerForm = document.getElementById('registerForm');
const submitBtn = $registerForm.querySelector(':scope > .button-container > .register');

$registerForm['emailCodeSendButton'].addEventListener('click', () => {
    const $emailLabel = $registerForm['email'].closest('[data-aeo-object="label"]');
    $emailLabel.setInValid(false);

    if ($registerForm['email'].validity.valueMissing) {
        $emailLabel.setInValid(true, '이메일을 입력해 주세요.');
        return;
    }
    if (!$registerForm['email'].validity.valid) {
        $emailLabel.setInValid(true, '올바른 이메일을 입력해 주세요.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $registerForm['email'].value);

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 300) {
            alert('인증번호 전송 중 오류가 발생했습니다.');
            return;
        }
        const res = JSON.parse(xhr.responseText);
        if (res.result === 'failure_duplicate') {
            alert('이미 사용 중인 이메일입니다.');
            $registerForm['email'].focus();
            $registerForm['email'].select();
            return;
        }
        if (res.result === 'success') {
            $registerForm['emailSalt'].value = res.salt;
            $registerForm['email'].setDisabled(true);
            $registerForm['emailCodeSendButton'].setDisabled(true);
            $registerForm['emailCode'].setDisabled(false);
            $registerForm['emailCodeVerifyButton'].setDisabled(false);
            $registerForm['emailCode'].focus();
            alert('인증번호가 이메일로 전송되었습니다. 10분 내에 입력해 주세요.');
            return;
        }
        alert('알 수 없는 오류가 발생했습니다.');
    };
    xhr.open('POST', '/user/register-email');
    xhr.send(formData);
});

$registerForm['emailCodeVerifyButton'].addEventListener('click', () => {
    const $emailCodeLabel = $registerForm['emailCode'].closest('[data-aeo-object="label"]');
    $emailCodeLabel.setInValid(false);

    if ($registerForm['emailCode'].validity.valueMissing) {
        $emailCodeLabel.setInValid(true, '인증번호를 입력해 주세요.');
        return;
    }
    if (!$registerForm['emailCode'].validity.valid) {
        $emailCodeLabel.setInValid(true, '올바른 인증번호를 입력해 주세요.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $registerForm['email'].value);
    formData.append('code', $registerForm['emailCode'].value);
    formData.append('salt', $registerForm['emailSalt'].value);

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 300) {
            alert('인증번호 확인 중 오류가 발생했습니다.');
            return;
        }
        const res = JSON.parse(xhr.responseText);
        if (res.result === 'failure_expired') {
            $registerForm['emailSalt'].value = '';
            $registerForm['email'].setDisabled(false);
            $registerForm['emailCodeSendButton'].setDisabled(false);
            $registerForm['emailCode'].value = '';
            $registerForm['emailCode'].setDisabled(true);
            $registerForm['emailCodeVerifyButton'].setDisabled(true);
            $registerForm['email'].focus();
            alert('인증 정보가 만료되었습니다. 다시 인증해 주세요.');
            return;
        }
        if (res.result === 'success') {
            $registerForm['emailCode'].setDisabled(true);
            $registerForm['emailCodeVerifyButton'].setDisabled(true);
            alert('이메일 인증이 완료되었습니다.');
            return;
        }
        alert('인증번호가 올바르지 않습니다. 다시 확인해 주세요.');
    };
    xhr.open('PATCH', '/user/register-email');
    xhr.send(formData);
});

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const $nameLabel = $registerForm['name'].closest('[data-aeo-object="label"]');
    const $emailLabel = $registerForm['email'].closest('[data-aeo-object="label"]');
    const $passwordLabel = $registerForm['password'].closest('[data-aeo-object="label"]');
    const $nicknameLabel = $registerForm['nickname'].closest('[data-aeo-object="label"]');
    const $birthLabel = $registerForm['birth'].closest('[data-aeo-object="label"]');
    const $contactLabel = $registerForm['contactSecond'].closest('[data-aeo-object="label"]');
    const $addressLabel = $registerForm['addressPostal'].closest('[data-aeo-object="label"]');
    const $termLabel = $registerForm['agreeServiceTerm'].closest('[data-aeo-object="label"]');
    const $privacyLabel = $registerForm['agreePrivacy'].closest('[data-aeo-object="label"]');

    if ($nameLabel?.setInValid) $nameLabel.setInValid(false);
    if ($emailLabel?.setInValid) $emailLabel.setInValid(false);
    if ($passwordLabel?.setInValid) $passwordLabel.setInValid(false);
    if ($nicknameLabel?.setInValid) $nicknameLabel.setInValid(false);
    if ($birthLabel?.setInValid) $birthLabel.setInValid(false);
    if ($contactLabel?.setInValid) $contactLabel.setInValid(false);
    if ($addressLabel?.setInValid) $addressLabel.setInValid(false);
    if ($termLabel?.setInValid) $termLabel.setInValid(false);
    if ($privacyLabel?.setInValid) $privacyLabel.setInValid(false);

    if ($registerForm['name'].validity.valueMissing) {
        $nameLabel.setInValid(true, '이름을 입력해 주세요.');
        return;
    }
    if (!$registerForm['name'].validity.valid) {
        $nameLabel.setInValid(true, '올바른 이름을 입력해 주세요.');
        return;
    }

    if ($registerForm['email'].validity.valueMissing) {
        $emailLabel.setInValid(true, '이메일을 입력해 주세요.');
        return;
    }
    if (!$registerForm['email'].validity.valid) {
        $emailLabel.setInValid(true, '올바른 이메일을 입력해 주세요.');
        return;
    }
    if (!$registerForm['email'].hasAttribute('disabled')) {
        $emailLabel.setInValid(true, '이메일 인증을 완료해 주세요.');
        return;
    }

    if ($registerForm['password'].validity.valueMissing) {
        $passwordLabel.setInValid(true, '비밀번호를 입력해 주세요.');
        return;
    }
    if (!$registerForm['password'].validity.valid) {
        $passwordLabel.setInValid(true, '올바른 비밀번호를 입력해 주세요.');
        return;
    }
    if ($registerForm['passwordCheck'].validity.valueMissing) {
        $passwordLabel.setInValid(true, '비밀번호를 한번 더 입력해 주세요.');
        return;
    }
    if ($registerForm['password'].value !== $registerForm['passwordCheck'].value) {
        $passwordLabel.setInValid(true, '비밀번호가 일치하지 않습니다.');
        return;
    }

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
    if ($registerForm['contactSecond'].validity.valueMissing || $registerForm['contactThird'].validity.valueMissing) {
        $contactLabel.setInValid(true, '전화번호를 입력해 주세요.');
        return;
    }
    if (!$registerForm['contactSecond'].validity.valid || !$registerForm['contactThird'].validity.valid) {
        $contactLabel.setInValid(true, '올바른 전화번호를 입력해 주세요.');
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
    formData.append('name', $registerForm['name'].value);
    formData.append('email', $registerForm['email'].value);
    formData.append('code', $registerForm['emailCode'].value);
    formData.append('salt', $registerForm['emailSalt'].value);
    formData.append('password', $registerForm['password'].value);
    formData.append('nickname', $registerForm['nickname'].value);
    formData.append('birth', $registerForm['birth'].value);
    formData.append('gender', $registerForm['gender'].value);
    formData.append('contactMvnoCode', $registerForm['contactMvno'].value);
    formData.append('contactFirst', $registerForm['contactFirst'].value);
    formData.append('contactSecond', $registerForm['contactSecond'].value);
    formData.append('contactThird', $registerForm['contactThird'].value);
    formData.append('addressPostal', $registerForm['addressPostal'].value);
    formData.append('addressPrimary', $registerForm['addressPrimary'].value);
    formData.append('addressSecondary', $registerForm['addressSecondary'].value);
    formData.append('lifeCycleCode', $registerForm['lifeCode'].value);
    formData.append('householdTypeCode', $registerForm['houseCode'].value);
    formData.append('interestSubCode', $registerForm['interestCode'].value);

    formData.append('agreeServiceTerm', $registerForm['agreeServiceTerm'].checked);
    formData.append('agreePrivacy', $registerForm['agreePrivacy'].checked);

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 300) {
            alert('회원가입 처리 중 오류가 발생했습니다.');
            return;
        }
        const res = JSON.parse(xhr.responseText);
        if (res.result === 'failure_duplicate_email') {
            alert('입력하신 이메일은 이미 사용 중입니다.');
            return;
        }
        if (res.result === 'failure_duplicate_nickname') {
            alert('입력하신 닉네임은 이미 사용 중입니다.');
            return;
        }
        if (res.result === 'failure_duplicate_contact') {
            alert('입력하신 연락처는 이미 사용 중입니다.');
            return;
        }
        if (res.result === 'success') {
            alert('회원가입이 완료되었습니다.');
            location.href = '/user/login';
            return;
        }
        alert('알 수 없는 이유로 회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    };
    xhr.open('POST', '/user/register');
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

