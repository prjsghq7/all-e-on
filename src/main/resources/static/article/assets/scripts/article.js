const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
const $defaultArea = document.getElementById('defaultArea');
const $commentForm = document.getElementById("commentForm");
const $commentContainer = document.getElementById('commentContainer');
const $pageContainer = document.getElementById('pageContainer');
const $modifyBtn = $defaultArea.querySelector(':scope>.container>.title-container>.adjust-container>.modify');
const $deleteBtn = $defaultArea.querySelector(':scope>.container>.title-container>.adjust-container>.delete');

if ($modifyBtn !== null) {
    $modifyBtn.addEventListener('click', () => {
        const url = new URL(location.href);
        const index = url.searchParams.get('index');
        location.href = `${origin}/article/modify?index=${index}`
    })
}

document.addEventListener('DOMContentLoaded', () => {
    loadComments(1);
});

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
        switch (response.result) {
            case 'success':
                loadComments(1);
                $commentForm['content'].value = '';
                break;
            case'failure_absent':
                dialog.showSimpleOk('오류', '로그인이 필요한 작업입니다.');
                break;
            default:
                dialog.showSimpleOk('오류', '댓글 등록중 오류가 발생하였습니다.\n잠시후 재시도 부탁드립니다.');
        }
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

        const commentsResponse = JSON.parse(xhr.responseText);
        updateComments(commentsResponse.comments);
        updatePageContainer(commentsResponse.pageVo);
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

const updatePageContainer = (pageVo) => {
    $pageContainer.innerHTML = '';
    for (let pageNum = pageVo.startPage; pageNum <= pageVo.endPage; pageNum++) {
        const $button = document.createElement('button');
        $button.className = 'page';
        $button.innerText = pageNum;

        if (pageNum === pageVo.page) {
            $button.classList.add('-selected');
        }

        $pageContainer.appendChild($button);
    }

    $pageContainer.querySelectorAll('.page').forEach(($btn) => {
        $btn.addEventListener('click', () => {
            const pageNum = $btn.innerText;
            loadComments(pageNum);
        });
    });
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
                    
                    <button class="action modify" 
                        data-comment-mine="${comment['mine']}"
                        data-comment-type="comment"
                        data-comment-index="${comment['index']}"
                        data-comment-content="${comment['content']}">수정</button>
                    <button class="action delete"
                        data-comment-mine="${comment['mine']}"
                        data-comment-type="comment"
                        data-comment-index="${comment['index']}">삭제</button>
                        
                    <button class="show-recomments" type="button" data-comment-index="${comment['index']}"
                    aria-expanded="false">
                    <img src="/article/assets/images/down.png" class="down" alt="댓글 더보기">
                    <img src="/article/assets/images/up.png" class="up" alt="댓글 안보기">
                    </button>
                    <button class="write-recomment" type="button">댓글 작성</button>
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

        $commentContainer.querySelectorAll('.action.delete').forEach(($btnDelete) => {
            $btnDelete.addEventListener('click', openDeleteModal);
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
                        data-comment-mine="${recomment['mine']}"
                        data-comment-type="recomment"
                        data-comment-index="${recomment['index']}"
                        data-comment-content="${recomment['content']}">수정</button>
                    <button class="action delete"
                        data-comment-mine="${recomment['mine']}"
                        data-comment-type="recomment"
                        data-comment-index="${recomment['index']}">삭제</button>
                </div>
                <label class="body">
                    <span class="comment">${recomment['content']}</span>
                </label>
            </div>`);
    }

    $recommentContainer.querySelectorAll('.action.modify').forEach(($btnModify) => {
        $btnModify.addEventListener('click', openModifyModal);
    });

    $recommentContainer.querySelectorAll('.action.delete').forEach(($btnDelete) => {
        $btnDelete.addEventListener('click', openDeleteModal);
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
                $replyForm.style.display = 'none';
                break;
            case'failure_absent':
                dialog.showSimpleOk('오류', '로그인이 필요한 작업입니다.');
                break;
            case'failure_doesnt_exist':
                dialog.showSimpleOk('오류', '상위 댓글이 삭제되었거나 존재하지 않습니다.');
                break;
            default:
                dialog.showSimpleOk('오류', '대댓글 작성중 오류가 발생하였습니다.\n잠시후 재시도 부탁드립니다.');
        }
    };
    xhr.open('POST', '/api/article/recomments/upload');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
}


const deleteArticle = (articleIndex) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('index', articleIndex);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('요청', `요청 중 오류${xhr.status}`);
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case'success':
                dialog.showSimpleOk('게시글', '게시글 삭제에 성공하였습니다.', () => {
                    location.href = `${origin}/article/list`;
                })
                break;
            case'failure':
                dialog.showSimpleOk('게시글', '게시글 삭제에 실패하였습니다.');
                break;
            case 'failure_doesnt_exit':
                dialog.showSimpleOk('게시글', '게시글이 존재하지 않습니다.');
                break;
            case'failure_not_same':
                dialog.showSimpleOk('게시글', '게시글 삭제할 권한이 없습니다.');
                break;
            default:
                dialog.showSimpleOk('게시글', '게시글 삭제에 실패하였습니다.');
        }
    };
    xhr.open('DELETE', '/api/article/delete');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
}
const openDeleteArticleModal = (e) => {
    const url = new URL(location.href);
    const index = url.searchParams.get('index');
    dialog.show({
        title: '게시글 삭제', content: '게시글 삭제 시, 복구가 불가능 합니다.\n정말로 삭제하시겠습니까?', buttons: [{
            caption: '취소', color: 'gray', onClickCallback: ($modal) => dialog.hide($modal)
        }, {
            caption: '삭제', color: 'blue', onClickCallback: ($modal) => {
                dialog.hide($modal);
                deleteArticle(index);
            }
        }]
    })
}

if ($deleteBtn !== null) {
    $deleteBtn.addEventListener('click', openDeleteArticleModal);
}

const deleteComment = (commentIndex, commentType) => {
    let requestUrl;
    if (commentType === 'comment') {
        requestUrl = '/api/article/comment/delete';
    } else if (commentType === 'recomment') {
        requestUrl = '/api/article/recomment/delete';
    } else {
        alert('잘못된 접근입니다.');
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('index', commentIndex);
    formData.append('content', commentType);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert(`${xhr.status} 에러`);
            return;
        }

        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'success':
                loadComments(1);
                break;
            case'failure_absent':
                dialog.showSimpleOk('오류', '로그인이 필요한 작업입니다.');
                break;
            case'failure_not_same':
                dialog.showSimpleOk('오류', '수정을 하고자 하는 댓글에 대한 권한이 없습니다.');
                break;
            default:
                dialog.showSimpleOk('오류', '댓글 수정중 오류가 발생하였습니다.\n잠시후 재시도 부탁드립니다.');
        }
    };
    xhr.open('DELETE', requestUrl);
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
}

const openDeleteModal = (e) => {
    const $btn = e.currentTarget;
    const commentType = $btn.dataset.commentType;
    const commentIndex = $btn.dataset.commentIndex;

    dialog.show({
        title: '댓글 삭제', content: '댓글 삭제 시, 복구가 불가능 합니다.\n정말로 삭제하시겠습니까?', buttons: [{
            caption: '취소', color: 'gray', onClickCallback: ($modal) => dialog.hide($modal)
        }, {
            caption: '삭제', color: 'blue', onClickCallback: ($modal, $btn) => {
                dialog.hide($modal);
                deleteComment(commentIndex, commentType);
            }
        }]
    })
}

const $modifyModal = document.getElementById('modifyModal');
const $modifyForm = $modifyModal.querySelector('.modify-form');
const $closeBtn = $modifyModal.querySelector('.modal-close');

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
        switch (response.result) {
            case 'success':
                closeModifyModal();
                break;
            case'failure_absent':
                dialog.showSimpleOk('오류', '로그인이 필요한 작업입니다.');
                break;
            case'failure_doesnt_exist':
                dialog.showSimpleOk('오류', '게시글이 삭제되었거나 존재하지 않습니다.');
                break;
            case'failure_not_same':
                dialog.showSimpleOk('오류', '수정을 하고자 하는 댓글에 대한 권한이 없습니다.');
                break;
            default:
                dialog.showSimpleOk('오류', '댓글 수정중 오류가 발생하였습니다.\n잠시후 재시도 부탁드립니다.');
        }
    };
    xhr.open('PATCH', requestUrl);
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
});

