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
            console.log("에러");
            // dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        if (response.result === true) {
            console.log(response.result.toString());
        } else if (response.result === false) {
            console.log(response.result.toString());
        } else {
            console.log(response.result.toString());
        }
    };
    xhr.open('PATCH', '/welfare/like');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);




    /*// 좋아요 상태에 따른 처리
    if (this.classList.contains('active')) {
        console.log(`복지 ID ${welfareId} 좋아요 추가`);
        // 여기에 서버로 좋아요 추가 요청을 보내는 로직을 추가할 수 있습니다
    } else {
        console.log(`복지 ID ${welfareId} 좋아요 취소`);
        // 여기에 서버로 좋아요 취소 요청을 보내는 로직을 추가할 수 있습니다
    }*/
});
