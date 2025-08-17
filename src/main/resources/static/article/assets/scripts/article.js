const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

const $commentForm = document.getElementById("commentForm");
const $commentContainer = document.getElementById('commentContainer');

$commentForm.addEventListener('submit', (e) => {
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
        loadComments(1);
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
    $commentContainer.innerHTML = '';

    for (const comment of comments) {
        $commentContainer.insertAdjacentHTML('beforeend', `
            <div class="comment">
                <div class="head">
                    <span class="writer">${comment['nickname']}</span>
                    <span class="timestamp">${comment['createdAt'].split('T').join(' ')}</span>
                    <span class="-flex-stretch"></span>
                    <button class="show-recomments" type="button" data-comment-index="${comment['index']}">대댓글 보기</button>
                    <button class="write-recomment" type="button">대댓글 작성</button>
                    <a class="action">수정</a>
                    <a class="action">삭제</a>
                </div>
                <label class="body">
                    <span class="comment">${comment['content']}</span>
                </label>
                
                <div class="recomment-container"></div>

                <form class="reply-form">
                    <input hidden name="commentIndex" type="hidden" value="${comment['index']}">
                    <label class="--object-label -flex-stretch">
                        <textarea required class="--object-field -flex-stretch" minlength="1" maxlength="1000" name="content" placeholder="댓글을 입력해 주세요." rows="4"></textarea>
                    </label>
                    <button class="--object-button -color-green" type="submit">댓글 등록하기</button>
                </form>
            </div>`);

        $commentContainer.querySelectorAll('.write-recomment').forEach(($toggleRecomments) => {
            $toggleRecomments.addEventListener('click', toggleReplyForm);
        });

        $commentContainer.querySelectorAll('.show-recomments').forEach(($toggleReplyForm) => {
            $toggleReplyForm.addEventListener('click', toggleRecomments);
        });

        $commentContainer.querySelectorAll('.reply-form').forEach(($replyForm) => {
            $replyForm.addEventListener('submit', uploadRecomment);
        });
    }
}

const updateRecomments = ($recommentContainer, recomments) => {
    console.log(recomments);
    $recommentContainer.innerHTML = '';

    for (const recomment of recomments) {
        $recommentContainer.insertAdjacentHTML('beforeend', `
            <div class="recomment">
                <div class="head">
                    <span class="writer">${recomment['nickname']}</span>
                    <span class="timestamp">${recomment['createdAt'].split('T').join(' ')}</span>
                    <span class="-flex-stretch"></span>
                    <a class="action">수정</a>
                    <a class="action">삭제</a>
                </div>
                <label class="body">
                    <span class="comment">${recomment['content']}</span>
                </label>
            </div>`);
    }
}

const loadRecomments = ($recommentContainer, commentIndex) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert("요청중 오류");
            return;
        }

        const recomments = JSON.parse(xhr.responseText);
        updateRecomments($recommentContainer, recomments)
    };
    xhr.open('GET', `${origin}/api/article/recomments?commentIndex=${commentIndex}`);
    xhr.setRequestHeader(header, token);
    xhr.send();
}

const toggleRecomments = (e) => {
    const $comment = e.currentTarget.closest('.comment');
    const $recommentContainer = $comment.querySelector('.recomment-container');
    const commentIndex = e.currentTarget.dataset.commentIndex;
    if ($recommentContainer.style.display === 'flex') {
        $recommentContainer.style.display = 'none';
    } else {
        loadRecomments($recommentContainer, commentIndex);
        $recommentContainer.style.display = 'flex';
    }
};

const toggleReplyForm = (e) => {
    const $comment = e.currentTarget.closest('.comment');
    const $replyForm = $comment.querySelector('.reply-form');
    $replyForm.style.display = $replyForm.style.display === 'flex' ? 'none' : 'flex';
};

const uploadRecomment = (e) => {
    e.preventDefault();

    const $replyForm = e.currentTarget;

    if ($replyForm['content'].value === '') {
        dialog.showSimpleOk('대댓글 작성', '내용을 입력해 주세요.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('commentIndex', $replyForm['commentIndex'].value);
    formData.append('content', $replyForm['content'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert(`${xhr.status} 에러`);
            return;
        }

        const response = JSON.parse(xhr.responseText);
        console.log(response.result);
        switch (response.result) {
            case 'success':
                alert('대댓글 작성 성공');
                $replyForm['content'].value = '';
                break;
            default:
        }
    };
    xhr.open('POST', '/api/article/recomments/upload');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
}

document.addEventListener('DOMContentLoaded', () => {
    loadComments(1);
});