const $defaultArea = document.getElementById('defaultArea');
const $table = $defaultArea.querySelector(':scope>.list-container>table');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
const modifyBtn = $defaultArea.querySelector(':scope>.container>.title-container>.modify');
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // persisted === true 이면 bfcache에서 복원된 것
        location.reload();
    }
});

modifyBtn.addEventListener('click',()=>{
    let index = $defaultArea.querySelector(':scope>.container>.title-container>input[name="articleIndex"]').value;
    location.href=`${origin}/notice/modify?index=${index}`;
})
