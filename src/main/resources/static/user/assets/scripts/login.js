const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

const $loginForm = document.getElementById('loginForm');
const $loginBtn = $loginForm.querySelector('.login-button')
const $login = document.getElementById('login');

$login.querySelector(':scope>.title').addEventListener('click',()=>{
    location.href = `${origin}/home`;
})

$loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if ($loginForm['email'].validity.valueMissing) {
        dialog.showSimpleOk('오류','이메일을 입력해 주세요.')
        return;
    }
    if (!$loginForm['email'].validity.valid) {
        dialog.showSimpleOk('오류', '올바른 이메일을 입력해주세요.');
        return;
    }
    if ($loginForm['password'].validity.valueMissing) {
        dialog.showSimpleOk('오류', '비밀번호를 입력해주세요.');
    }
    if (!$loginForm['password'].validity.valid) {
        dialog.showSimpleOk('오류', '올바른 비밀번호를 입력해주세요.');
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
        loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('오류', '알 수 없는 오류로 로그인을 할 수 없습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'failure_suspended':
                dialog.showSimpleOk('오류', '로그인을 할 수 없습니다.');
                break;
            case 'success':
                location.href = `${origin}/home`
                if ($loginForm['remember'].checked) {
                    localStorage.setItem('loginEmail', $loginForm['email'].value);
                } else {
                    localStorage.removeItem('loginEmail');
                }
                break;
            default:
                dialog.showSimpleOk('오류', '로그인을 할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }

    };
    xhr.open('POST', '/user/login');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
    loading.show();
});

$loginForm['email'].value = localStorage.getItem('loginEmail') ?? '';
$loginForm['remember'].checked = localStorage.getItem('loginEmail') ?? '';
