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

$commentContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.show-recomments');
    if (!btn || !$commentContainer.contains(btn)) return;

    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));

    const box = btn.closest('.comment')?.querySelector('.recomment-container');
    if (box) box.classList.toggle('is-open', !expanded);
});

const updateComments = (comments) => {
    $commentContainer.innerHTML = '';

    for (const comment of comments) {
        $commentContainer.insertAdjacentHTML('beforeend', `
            <div class="comment">
                <div class="head">
                    <span class="writer">${comment['nickname']}</span>
                    <span class="timestamp">${comment['createdAt'].split('T').join(' ')}</span>
                    <span class="-flex-stretch"></span>
                    <button class="show-recomments" type="button" data-comment-index="${comment['index']}"
                    aria-expanded="false">
                    <img src="/article/assets/images/down.png" class="down" alt="댓글 더보기">
                    <img src="/article/assets/images/up.png" class="up" alt="댓글 안보기">
                    </button>
                    <button class="write-recomment" type="button">댓글 작성</button>
                    <button class="action modify" 
                        data-comment-type="comment"
                        data-comment-index="${comment['index']}"
                        data-comment-content="${comment['content']}">수정</button>
                    <button class="action">삭제</button>
                </div>
                <div class="body">
                    <span class="comment">${comment['content']}</span>
                </div>
<!--
                <form class="modify-form">
                    <input type="hidden" name="index">
                    <input class="content" type="text" name="content" value="${comment['content']}">
                    <button type="submit">수정하기</button>
                </form>
-->
                
                <div class="recomment-container"></div>

                <form class="reply-form">
                    <input hidden name="commentIndex" type="hidden" value="${comment['index']}">
                    <input class="content" type="text" name="content">
                    <button type="submit">등록하기</button>
                </form>
            </div>`);

        $commentContainer.querySelectorAll('.action.modify').forEach(($btnModify) => {
            $btnModify.addEventListener('click', openModifyModal);
        });

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
                <img src="/article/assets/images/replyArrow.png" class="reply" alt="">
                    <span class="writer">${recomment['nickname']}</span>
                    <span class="timestamp">${recomment['createdAt'].split('T').join(' ')}</span>
                    <span class="-flex-stretch"></span>
                    <button class="action modify" 
                        data-comment-type="recomment"
                        data-comment-index="${recomment['index']}"
                        data-comment-content="${recomment['content']}">수정</button>
                    <button class="action">삭제</button>
                </div>
                <label class="body">
                    <span class="comment">${recomment['content']}</span>
                </label>
            </div>`);
    }

    $recommentContainer.querySelectorAll('.action.modify').forEach(($btnModify) => {
        $btnModify.addEventListener('click', openModifyModal);
    });
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



const $modifyModal = document.getElementById('modifyModal');
const $modifyForm  = $modifyModal.querySelector('.modify-form');
const $closeBtn    = $modifyModal.querySelector('.modal-close');

const openModifyModal = (e) => {
    const $btn = e.currentTarget;

    $modifyForm['commentType'].value = $btn.dataset.commentType;
    $modifyForm['index'].value = $btn.dataset.commentIndex;
    $modifyForm['content'].value = $btn.dataset.commentContent;
    $modifyModal.classList.add('-show');
};

const closeModifyModal = () => {
    $modifyModal.classList.remove('-show');
};

// 닫기 버튼 / 배경 클릭 / ESC
$closeBtn.addEventListener('click', closeModifyModal);
$modifyModal.addEventListener('click', (e) => {
    if (e.target === $modifyModal) {
        closeModifyModal();
    }
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModifyModal();
    }
});

$modifyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if ($modifyForm['content'].value === '') {
        alert('내용을 입력해 주세요.');
        $modifyForm['content'].focus();
        return;
    }

    let requestUrl;
    if ($modifyForm['commentType'].value === 'comment') {
        requestUrl = '/api/article/comment/modify';
    } else if ($modifyForm['commentType'].value === 'recomment') {
        requestUrl = '/api/article/recomment/modify';
    } else {
        alert('잘못된 접근입니다.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('index', $modifyForm['index'].value);
    formData.append('content', $modifyForm['content'].value);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert(`${xhr.status} 에러`);
            return;
        }

        const response = JSON.parse(xhr.responseText);
        alert(response.result);
    };
    xhr.open('PATCH', requestUrl);
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});