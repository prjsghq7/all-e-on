const $loginForm = document.getElementById('loginForm');
const $loginBtn = $loginForm.querySelector('.login-button')

$loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if ($loginForm['email'].validity.valueMissing) {
        alert('이메일 입력해주세요.');
        return;
    }
    if (!$loginForm['email'].validity.valid) {
        alert('올바른 이메일 입력 ㄱㄱ');
        return;
    }
    if ($loginForm['password'].validity.valueMissing) {
        alert('비밀번호 입력 ㄱ');
    }
    if (!$loginForm['password'].validity.valid) {
        alert('올바른 비밀번호 입력 ㄱ');
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', $loginForm['email'].value);
    formData.append('password', $loginForm['password'].value);

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
            case 'failure_suspended':
                alert('로그인 실패');
                break;
            case 'success':
                alert('성공!');
                if ($loginForm['remember'].checked) {
                    localStorage.setItem('loginEmail', $loginForm['email'].value);
                } else {
                    localStorage.removeItem('loginEmail');
                }
                location.href = `${origin}/`
                break;
            default:
                alert('로그인 실패');
        }

    };
    xhr.open('POST', '/user/login');
    xhr.send(formData);
});

$loginForm['email'].value = localStorage.getItem('loginEmail') ?? '';
$loginForm['remember'].checked = localStorage.getItem('loginEmail') ?? '';
