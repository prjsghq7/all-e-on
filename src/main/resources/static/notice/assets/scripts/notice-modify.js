const $modifyForm = document.getElementById('modifyForm');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
$modifyForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const url = new URL(location.href);
    const index = url.searchParams.get("index");
    formData.append('index', index);
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
                dialog.showSimpleOk('공지사항 수정', '공지사항 수정에 성공하였습니다.',()=>{
                    location.href=`${origin}/notice/specific?index=${index}`
                })
                break;
            case 'failure':
                dialog.showSimpleOk('공지사항 수정', '공지사항 수정에 실패하였습니다.');
                break;
            case'failure_absent':
                dialog.showSimpleOk('공지사항 수정', '공지사항 수정하기 위해서는 관리자 로그인이 필요합니다.');
                break;
            default:
                break;
        }
    };
    xhr.open('PATCH', '/api/notice/modify');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
})