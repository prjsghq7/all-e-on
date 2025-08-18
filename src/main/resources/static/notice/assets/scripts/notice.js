const $defaultArea = document.getElementById('defaultArea');
const $table = $defaultArea.querySelector(':scope>.list-container>table');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
const modifyBtn = $defaultArea.querySelector(':scope>.container>.title-container>.adjust-container>.modify');
const deleteBtn = $defaultArea.querySelector(':scope>.container>.title-container>.adjust-container>.delete')
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // persisted === true 이면 bfcache에서 복원된 것
        location.reload();
    }
});

modifyBtn.addEventListener('click', () => {
    const url = new URL(location.href);
    const index = url.searchParams.get("index");
    location.href = `${origin}/notice/modify?index=${index}`;
})

deleteBtn.addEventListener('click', () => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const url = new URL(location.href);
    const index = url.searchParams.get("index");
    formData.append("index", index);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert('요청 중 오류');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        const result = response.result;
        switch (result) {
            case 'success':
                dialog.show({title: '삭제',
                content:'삭제에 성공하셨습니다',
                buttons:[
                    {
                        caption:'확인',
                        color:'green',
                        onClickCallback:($modal)=>{
                            location.href = `${origin}/notice/`;
                        }
                    }
                ]})
                break;
            case'failure':
                dialog.showSimpleOk('삭제', '삭제에 실패하셨습니다.');
                break;
            case'failure_doesnt_exit':
                dialog.showSimpleOk('삭제', '존재하지 않거나 이미 삭제된 공지사항입니다.');
                break;
            default:
                break;
        }
    };
    xhr.open('DELETE', '/api/notice/delete');
    xhr.setRequestHeader(header, token)
    xhr.send(formData);
})
