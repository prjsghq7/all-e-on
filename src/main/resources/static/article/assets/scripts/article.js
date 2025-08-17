const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

const $commentForm = document.getElementById("commentForm");
const $commentContainer = document.getElementById('commentContainer');

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
        alert(response.result);
    };
    xhr.open('POST', '/api/article/comment/upload');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});

const loadComments = (page) => {
    const xhr = new XMLHttpRequest();

    const articleIndex = new URL(location.href).searchParams.get('index')

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert("요청중 오류");
            return;
        }

        const comments = JSON.parse(xhr.responseText);
        updateComments(comments)
    };
    xhr.open('GET', `${origin}/api/article/comments?articleIndex=${articleIndex}&page=${page}`);
    xhr.setRequestHeader(header, token);
    xhr.send();
}

const updateComments = (comments) => {
    console.log(comments);
}

document.addEventListener('DOMContentLoaded', () => {
    loadComments(1);
});