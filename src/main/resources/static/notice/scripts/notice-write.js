const $noticeForm = document.getElementById('noticeForm');
const $title = $noticeForm.querySelector(':scope>label>.title');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
$noticeForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    if (editor.getData() === '') {
        alert('게시글 입력해주세요.');
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('title', $title.value);
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
        switch (response) {
            case'success':
                alert('등록 성공');
                break;
            case'failure':
                alert('등록 실패');
                break;
            case'failure_absent':
                alert('로그인 필ㅇ요');
                break;
            default:
                break;
        }
    };
    xhr.open('POST','/api/notice/submit');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
})