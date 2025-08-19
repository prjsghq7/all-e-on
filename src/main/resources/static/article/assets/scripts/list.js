window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // persisted === true 이면 bfcache에서 복원된 것
        location.reload();
    }
});