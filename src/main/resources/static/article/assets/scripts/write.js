const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
const $writeForm = document.getElementById('writeForm');
const $title = $writeForm.querySelector(':scope>#name>.title');

$writeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($title.value === '') {
        dialog.showSimpleOk('게시글 등록', '제목을 입력해주세요', () => {
            $title.focus();
        })
        return;
    }

    if (editor.getData() === '') {
        dialog.showSimpleOk('게시글 등록', '게시글을 입력해주세요.');
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('title', $writeForm['title'].value);
    formData.append('content', editor.getData());
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert('요청중 오류')
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case'success':
                dialog.showSimpleOk('게시글 등록', ' 게시글 등록에 성공하셨습니다.', () => {
                    location.href = `${origin}/article/list`;
                });
                break;
            case'failure':
                dialog.showSimpleOk('게시글 등록', ' 게시글 등록에 실패하였습니다.');
                break;
            case'failure_absent':
                dialog.showSimpleOk('게시글 등록', '게시글을 등록하기 위해서는 로그인이 필요합니다.');
                break;
            default:
                break;
        }
    };
    xhr.open('POST', '/api/article/write');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
})