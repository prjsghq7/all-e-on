const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
const $recoverForm = document.getElementById('recoverForm');

$recoverForm['pRecoverEmailCodeSendButton'].addEventListener('click', () => {
    const $emailLabel = $recoverForm['pRecoverEmail'].closest('[data-aeo-object="label"]');
    $emailLabel.setInValid(false);
    if ($recoverForm['pRecoverEmail'].validity.valueMissing) {
        $emailLabel.setInValid(true, '이메일을 입력해 주세요.');
    } else if (!$recoverForm['pRecoverEmail'].validity.valid) {
        $emailLabel.setInValid(true, '올바른 이메일을 입력해 주세요.');
    }
    if ($emailLabel.isInValid()) {
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $recoverForm['pRecoverEmail'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert('실패!');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'failure_absent':
                alert('입력한 이메일 몬찾는다.');
                break;
            case 'success':
                $recoverForm['emailSalt'].value = response.salt;
                $recoverForm['pRecoverEmail'].setDisabled(true);
                $recoverForm['pRecoverEmailCodeSendButton'].setDisabled(true);
                $recoverForm['pRecoverEmailCode'].setDisabled(false);
                $recoverForm['pRecoverEmailCodeVerifyButton'].setDisabled(false);
                $recoverForm['pRecoverEmailCode'].focus();
                alert('인증번호 전송 성공!');
                break;
            default:
                alert('알 수 없는 이유 실패');
        }

    };
    xhr.open('POST', '/user/recover-password-email');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});

$recoverForm['pRecoverEmailCodeVerifyButton'].addEventListener('click', () => {
    const $emailLabel = $recoverForm['pRecoverEmail'].closest('[data-aeo-object="label"]');
    $emailLabel.setInValid(false);
    if ($recoverForm['pRecoverEmailCode'].validity.valueMissing) {
        $emailLabel.setInValid(true, '인증번호를 입력해주세요.');
    } else if (!$recoverForm['pRecoverEmailCode'].validity.valid) {
        $emailLabel.setInValid(true, '올바른 인증번호를 입력해주세요.');
    }
    if ($emailLabel.isInValid()) {
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $recoverForm['pRecoverEmail'].value);
    formData.append('code', $recoverForm['pRecoverEmailCode'].value);
    formData.append('salt', $recoverForm['emailSalt'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert('실패');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'failure_expired':
                $recoverForm['emailSalt'].value = '';
                $recoverForm['pRecoverEmail'].setDisabled(false);
                $recoverForm['pRecoverEmailCodeSendButton'].setDisabled(false);
                $recoverForm['pRecoverEmailCode'].value = '';
                $recoverForm['pRecoverEmailCode'].setDisabled(true);
                $recoverForm['pRecoverEmailCodeVerifyButton'].setDisabled(true);
                $recoverForm['pRecoverEmail'].focus();
                alert('인증번호 만료');
                break;
            case 'success':
                $recoverForm['pRecoverEmailCode'].setDisabled(true);
                $recoverForm['pRecoverEmailCodeVerifyButton'].setDisabled(true);
                alert('성공!');
                break;
            default:
                alert('인증 번호키 안올바름', () => {
                    $recoverForm['pRecoverEmailCode'].focus();
                    $recoverForm['pRecoverEmailCode'].select();
                });
        }
    };
    xhr.open('PATCH', '/user/recover-password-email');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});

const recoverEmail = () => {
    const $nameLabel = $recoverForm['eRecoverName'].closest('[data-aeo-object="label"]');
    const $contactLabel = $recoverForm['eRecoverContactSecond'].closest('[data-aeo-object="label"]');

    const $labels = [$nameLabel, $contactLabel];
    $labels.forEach(($label) => {
        $label.setInValid(false);
    });

    if ($recoverForm['eRecoverName'].validity.valueMissing) {
        $nameLabel.setInValid(true, '이름을 입력해 주세요.');
    } else if (!$recoverForm['eRecoverName'].validity.valid) {
        $nameLabel.setInValid(true, '올바른 이름을 입력해 주세요.');
    } else if ($recoverForm['eRecoverBirth'].validity.valueMissing) {
        $nameLabel.setInValid(true, '생년월일을 입력해 주세요.');
    } else if (!$recoverForm['eRecoverBirth'].validity.valid) {
        $nameLabel.setInValid(true, '올바른 이름을 입력해 주세요.');
    }

    if ($recoverForm['eRecoverContactMvno'].value === '-1') {
        $contactLabel.setInValid(true, '통신사를 선택해 주세요.');
    } else if ($recoverForm['eRecoverContactSecond'].validity.valueMissing
        || $recoverForm['eRecoverContactThird'].validity.valueMissing) {
        $contactLabel.setInValid(true, '전화번호를 입력해 주세요.');
    } else if (!$recoverForm['eRecoverContactSecond'].validity.valid
        || !$recoverForm['eRecoverContactThird'].validity.valid) {
        $contactLabel.setInValid(true, '올바른 전화번호를 입력해 주세요.');
    }

    if ($labels.some($label => $label.isInValid())) {
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('name', $recoverForm['eRecoverName'].value);
    formData.append('birth', $recoverForm['eRecoverBirth'].value);
    formData.append('contactMvnoCode', $recoverForm['eRecoverContactMvno'].value);
    formData.append('contactFirst', $recoverForm['eRecoverContactFirst'].value);
    formData.append('contactSecond', $recoverForm['eRecoverContactSecond'].value);
    formData.append('contactThird', $recoverForm['eRecoverContactThird'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('계정 복구[이메일 찾기]', `[${xhr.status}]요청을 처리하는 도중 오류가 발생하였습니다.\n잠시 후 다시 시도해 주세요.`);
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response['result']) {
            case 'failure_absent':
                dialog.showSimpleOk('계정 복구[이메일 찾기]', '입력한 데이터와 일치하는 데이터를 찾지 못 하였습니다.\n다시 확인해 주세요.');
                break;
            case 'failure_suspended':
                dialog.showSimpleOk('계정 복구[이메일 찾기]', `해당 계정[${response['email']}]은/는 정지된 상태입니다.\n관리자에게 문의 해주세요.`);
                break;
            case 'success':
                dialog.show({
                    title: '계정 복구[이메일 찾기]',
                    content: `${$recoverForm['eRecoverName'].value}님의 이메일는 [${response['email']}]입니다.\n확인 버튼 클릭 시 로그인 페이지로 이동합니다.`,
                    buttons: [
                        {
                            caption: '확인',
                            color: 'blue',
                            onClickCallback: ($modal) => {
                                dialog.hide($modal);
                                location.href = '/user/login'
                            }
                        }
                    ]
                });
                break;
            default:
                alert('알수없는이유실패!');
        }
    };
    xhr.open('POST', '/user/recover-email');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
};

const recoverPassword = () => {
    const $emailLabel = $recoverForm['pRecoverEmail'].closest('[data-aeo-object="label"]');
    const $passwordLabel = $recoverForm['pRecoverPassword'].closest('[data-aeo-object="label"]');

    const $labels = [$emailLabel, $passwordLabel];

    $labels.forEach(($label) => {
        $label.setInValid(false);
    });

    if (!$recoverForm['pRecoverEmailCodeSendButton'].hasAttribute('disabled')
        || !$recoverForm['pRecoverEmailCodeVerifyButton'].hasAttribute('disabled')) {
        $emailLabel.setInValid(true, '이메일 인증을 완료해 주세요.');
    }
    if ($recoverForm['pRecoverPassword'].validity.valueMissing) {
        $passwordLabel.setInValid(true, '비밀번호를 입력해 주세요.');
    } else if (!$recoverForm['pRecoverPassword'].validity.valid) {
        $passwordLabel.setInValid(true, '올바른 비밀번호를 입력해 주세요.');
    } else if ($recoverForm['pRecoverPasswordCheck'].validity.valueMissing) {
        $passwordLabel.setInValid(true, '비밀번호를 한번 더 입력해 주세요.');
    } else if ($recoverForm['pRecoverPassword'].value !== $recoverForm['pRecoverPasswordCheck'].value) {
        $passwordLabel.setInValid(true, '비밀번호가 일치하지 않습니다.');
    }

    if ($labels.some($label => $label.isInValid())) {
        return false;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $recoverForm['pRecoverEmail'].value);
    formData.append('code', $recoverForm['pRecoverEmailCode'].value);
    formData.append('salt', $recoverForm['emailSalt'].value);
    formData.append('password', $recoverForm['pRecoverPassword'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('계정 복구[비밀번호 재설정]', `[${xhr.status}]요청을 처리하는 도중 오류가 발생하였습니다.\n잠시 후 다시 시도해 주세요.`);
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response['result']) {
            case 'failure_suspended':
                dialog.showSimpleOk('계정 복구[비밀번호 재설정]', `해당 계정[${$recoverForm['pRecoverEmail'].value}]은/는 정지된 상태로 비밀번호를 변경 할 수 없습니다.\n관리자에게 문의 해주세요.`);
                break;
            case 'success':
                dialog.show({
                    title: '계정 복구[비밀번호 재설정]',
                    content: `[${$recoverForm['pRecoverEmail'].value}]에 대한 비밀번호가 재설정되었습니다.\n확인 버튼 클릭 시 로그인 페이지로 이동합니다.`,
                    buttons: [
                        {
                            caption: '확인',
                            color: 'blue',
                            onClickCallback: ($modal) => {
                                dialog.hide($modal);
                                location.href = '/user/login'
                            }
                        }
                    ]
                });
                break;
            default:
                dialog.showSimpleOk('계정 복구[비밀번호 재설정]', '알 수 없는 이유로 비밀번호 재설정에 실패하였습니다.\n잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('POST', '/user/recover-password');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
};

$recoverForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if ($recoverForm['type'].value === '') {
        return;
    }

    if ($recoverForm['type'].value === 'email') {
        recoverEmail();
    } else if ($recoverForm['type'].value === 'password') {
        recoverPassword();
    }
});

$recoverForm.querySelectorAll('input[name="type"]').forEach(($input) => {
    $input.addEventListener('change', () => {
        const $submitCaption = $recoverForm.querySelector('button[type="submit"] > .--caption');
        if ($recoverForm['type'].value === 'email') {
            $submitCaption.innerText = '이메일 찾기';
        } else if ($recoverForm['type'].value === 'password') {
            $submitCaption.innerText = '비밀번호 재설정';
        } else {
            $submitCaption.innerText = '계정 복구';
        }
    });
});