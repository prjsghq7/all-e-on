const $defaultArea = document.getElementById('defaultArea');
const $modifyForm = document.getElementById('modifyForm');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
const $title = $modifyForm.querySelector(':scope>.title-container>label>input[name="title"]');

$modifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const url = new URL(location.href);
    const index = url.searchParams.get("index");
    formData.append('index', index);
    formData.append('title', $title.value);
    formData.append('content', editor.getData());
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('요청', '요청중 오류');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        const result = response.result;
        switch (result) {
            case'success':
                dialog.showSimpleOk('게시글', '게시글 수정에 성공하셨습니다.', () => {
                    location.href = `${origin}/article/?index=${index}`;
                });
                break;
            case'failure':
                dialog.showSimpleOk('게시글', '게시글 수정에 실패하였습니다.');
                break;
            case'failure_not_same':
                dialog.showSimpleOk('게시글', '게시글 수정할 권한이 없습니다.');
                break;
            case'failure_doesnt_exit':
                dialog.showSimpleOk('게시글', '게시글이 존재하지 않습니다.');
                break;
            default:
                break;
        }
    };
    xhr.open('PATCH', '/api/article/modify');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);

})