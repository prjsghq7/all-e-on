const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

const $writeForm = document.getElementById('writeForm');

$writeForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    if (editor.getData() === '') {
        alert('게시글 입력해주세요.');
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('title', $writeForm['title'].value);
    formData.append('content', editor.getData());
    xhr.onreadystatechange=()=>{
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300){
            alert('요청중 오류')
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case'success':
                location.href = `${origin}/article/list`;
                break;
            case'failure':
                alert('등록 실패');
                break;
            case'failure_absent':
                alert('로그인 필요');
                break;
            default:
                break;
        }
    };
    xhr.open('POST','/api/article/write');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
})