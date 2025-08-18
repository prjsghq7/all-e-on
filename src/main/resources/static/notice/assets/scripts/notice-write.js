const $noticeForm = document.getElementById('noticeForm');
const $title = $noticeForm.querySelector(':scope>label>.title');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
$noticeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($title.value === '') {
        dialog.showSimpleOk('공지사항 등록','제목을 입력해주세요',()=>{
            $title.focus();
        })
        return;
    }
    if (editor.getData() === '') {
        dialog.showSimpleOk('공지사항 등록', '게시글을 입력해주세요.');
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('title', $title.value);
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
        const result = response.result;
        switch (result) {
            case'success':
                dialog.showSimpleOk('공지사항 등록', ' 공지사항 등록에 성공하셨습니다.',()=>{
                    location.href=`${origin}/notice/`;
                });
                break;
            case'failure':
                dialog.showSimpleOk('공지사항 등록', ' 공지사항 등록에 실패하였습니다.');
                break;
            case'failure_absent':
                dialog.showSimpleOk('공지사항 등록', '공지사항을 등록하기 위해서는 로그인이 필요합니다.');
                break;
            default:
                break;
        }
    };
    xhr.open('POST', '/api/notice/submit');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
})


