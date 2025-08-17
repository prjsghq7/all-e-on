const $modifyForm = document.getElementById('modifyForm');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
$modifyForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const url = new URL(location.href);
    formData.append('index', url.searchParams.get("index"));
    formData.append("title", $modifyForm['title'].value);
    formData.append('content', editor.getData());

    xhr.onreadystatechange=()=>{
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300){
            alert('요청중 오류');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        const result = response.result;
        switch(result){
            case'success':
                alert('수정 성공');
                break;
            case 'failure':
                alert('수정 실패');
                break;
            case'failure_absent':
                alert('로그인 필요');
                break;
            default:
                break;
        }
    };
    xhr.open('PATCH', '/api/notice/modify');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
})