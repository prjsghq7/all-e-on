(() => {
    const form = document.getElementById('profileImageForm');
    const input = document.getElementById('profileImageInput');
    const img = document.querySelector('#avatarBox .avatar-img');
    const btnApply = document.getElementById('applyProfileBtn');
    const btnCancel = document.getElementById('cancelProfileBtn');
    const originalSrc = img.getAttribute('src');
    const MAX_MB = 2;
    const ALLOW = ['image/jpeg', 'image/png', 'image/webp'];

    const setDirty = (v) => form.setAttribute('data-dirty', v ? 'true' : 'false');

    function resetPreview() {
        img.src = originalSrc;
        input.value = '';
        setDirty(false);
        btnApply.disabled = true;
    }

    input.addEventListener('change', () => {
        if (!input.files || input.files.length === 0) {
            resetPreview();
            return;
        }
        const file = input.files[0];
        if (!ALLOW.includes(file.type)) {
            alert('JPG/PNG/WEBP만 업로드 가능합니다.');
            resetPreview();
            return;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            alert(`최대 ${MAX_MB}MB까지 업로드 가능합니다.`);
            resetPreview();
            return;
        }
        const reader = new FileReader();
        reader.onload = e => {
            img.src = e.target.result;
            setDirty(true);
            btnApply.disabled = false;
        };
        reader.readAsDataURL(file);
    });

    btnApply.addEventListener('click', () => {
        if (!btnApply.disabled) form.submit();
    });

    btnCancel.addEventListener('click', resetPreview);
})();