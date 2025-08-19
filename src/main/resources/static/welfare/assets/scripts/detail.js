const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');


// 좋아요 버튼 요소 선택
const $likeButton = document.querySelector('.button.like');

// 좋아요 버튼 클릭 이벤트 리스너 추가
$likeButton.addEventListener('click', function () {
    // active 클래스 토글
    this.classList.toggle('active');

    // 버튼의 data-id 값 가져오기
    const welfareId = this.getAttribute('data-id');

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('welfareId', welfareId);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        // if (response['result'] === true) {
        //     dialog.showSimpleOk('즐겨찾기', '즐겨찾기 추가 되었습니다.');
        //     // console.log(response.result.toString());
        // } else if (response.result === false) {
        //     dialog.showSimpleOk('즐겨찾기', '즐겨찾기 해제 되었습니다.');
        //     // console.log(response.result.toString());
        // } else {
        //     dialog.showSimpleOk('즐겨찾기', '처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        //     // console.log(response.result.toString());
        // }
    };
    xhr.open('PATCH', '/welfare/like');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});