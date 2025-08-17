const $commentForm = document.getElementById("commentForm");
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

$commentForm.addEventListener('submit' , (e) => {
   e.preventDefault();

   //TODO regex 처리 추후
    const articleIndex = new URL(location.href).searchParams.get('index');
    if (!articleIndex || isNaN(articleIndex)) {
        alert('잘못된 게시글 번호입니다.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("articleIndex", new URL(location.href).searchParams.get('index'));
    formData.append("content", $commentForm['content'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert("요청중 오류");
            return;
        }

        const response = JSON.parse(xhr.responseText);
        alert(response);
    };
    xhr.open('POST', '/api/article/comment/upload');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});