const $commentForm = document.getElementById("commentForm");


$commentForm.addEventListener('submit' , (e) => {
   e.preventDefault();

   //TODO regex 처리 추후

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    xhr.append("articleIndex", new URL(location.href).searchParams.get('index'));
    xhr.append("content", $commentForm['content'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            alert("요청중 오류");
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert("요청중 오류");
            return;
        }

        const response = JSON.parse(xhr.responseText);
        alert(response);
    };
    xhr.open('POST', 'api/article/comment/upload');
    xhr.send(formData);
});