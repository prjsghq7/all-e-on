const $defaultArea = document.getElementById('defaultArea');
const $table = $defaultArea.querySelector(':scope>.list-container>table');
const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // persisted === true 이면 bfcache에서 복원된 것
        location.reload();
    }
});
