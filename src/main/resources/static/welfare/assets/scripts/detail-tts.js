// /welfare/assets/scripts/detail-tts.js
(() => {
    const TTS_ENDPOINT = '/api/tts';
    const DEFAULT_VOICE = 'ko-KR-Wavenet-A';
    const DEFAULT_LANG  = 'ko-KR';
    const NONE_TEXT     = '등록된 데이터 정보가 없습니다.';
    const CLICK_DEBOUNCE_MS = 250;

    const getCsrf = () => {
        const t = document.querySelector('meta[name="_csrf"]')?.content;
        const h = document.querySelector('meta[name="_csrf_header"]')?.content;
        return (t && h) ? { header: h, token: t } : null;
    };

    const TTS = (() => {
        let seq = 0;
        return {
            _audio: null,
            _ac: null,
            stop() {
                if (this._audio) {
                    try { this._audio.pause(); URL.revokeObjectURL(this._audio.src); } catch {}
                    this._audio = null;
                }
                if (this._ac) { try { this._ac.abort(); } catch {} this._ac = null; }
                seq++;
            },
            async speak(text, opts = {}) {
                const s = (text || '').trim();
                if (!s) return;
                this.stop();
                const mySeq = ++seq;

                if (window.loading?.show) loading.show('음성을 준비하고 있어요…');

                const payload = {
                    text: s,
                    languageCode: DEFAULT_LANG,
                    voiceName: opts.voiceName || DEFAULT_VOICE,
                    speakingRate: (typeof opts.rate === 'number') ? opts.rate : 1.0,
                    pitch: (typeof opts.pitch === 'number') ? opts.pitch : 0.0,
                    audioEncoding: 'MP3',
                    useSsml: !!opts.useSsml
                };

                const headers = { 'Content-Type': 'application/json' };
                const csrf = getCsrf(); if (csrf) headers[csrf.header] = csrf.token;

                this._ac = new AbortController();
                let blob;
                try {
                    const res = await fetch(TTS_ENDPOINT, {
                        method: 'POST',
                        headers,
                        credentials: 'same-origin',
                        body: JSON.stringify(payload),
                        signal: this._ac.signal
                    });
                    if (!res.ok) throw new Error('TTS HTTP ' + res.status);
                    blob = await res.blob();
                } catch (e) {
                    if (window.loading?.hide) loading.hide();
                    return; // 웹 TTS 폴백 사용 안 함
                }

                if (mySeq !== seq) { if (window.loading?.hide) loading.hide(); return; }

                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                this._audio = audio;

                audio.onended = () => {
                    URL.revokeObjectURL(url);
                    if (this._audio === audio) this._audio = null;
                    if (window.loading?.hide) loading.hide();
                };
                audio.onerror = () => {
                    URL.revokeObjectURL(url);
                    if (window.loading?.hide) loading.hide();
                };

                try { await audio.play(); }
                catch { if (window.loading?.hide) loading.hide(); }
            }
        };
    })();

    let lastClickAt = 0;

    const sectionHasRealItems = (sectionEl) => {
        return [...sectionEl.querySelectorAll('.detail-explain ul > li:not(.none)')]
            .map(li => (li.textContent || '').trim())
            .some(t => t && t !== NONE_TEXT);
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.content[data-mt-radio] > .title-speak, .title > .title-speak').forEach(btn => {
            const container = btn.closest('.content[data-mt-radio]') || btn.closest('.title');
            if (!container) return;
            if (container.classList.contains('title')) return; // 제목 읽기 버튼은 항상 활성
            if (!sectionHasRealItems(container)) btn.setAttribute('disabled', '');
        });
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.title-speak');
        if (!btn || btn.hasAttribute('disabled')) return;

        const now = Date.now();
        if (now - lastClickAt < CLICK_DEBOUNCE_MS) return;
        lastClickAt = now;

        e.preventDefault(); e.stopPropagation();

        const titleBox = btn.closest('.title');
        if (titleBox) {
            const h2  = titleBox.querySelector('h2')?.textContent?.trim() || '';
            const sub = titleBox.querySelector('span')?.textContent?.trim() || '';
            const text = [h2, sub].filter(Boolean).join('. ').trim();
            if (text) TTS.speak(text, { voiceName: btn.dataset.voice || undefined });
            return;
        }

        const section = btn.closest('.content[data-mt-radio]');
        if (!section) return;

        const parts = [];
        section.querySelectorAll('.detail-explain').forEach(sec => {
            const title = sec.querySelector('h3')?.textContent?.trim();
            const items = [...sec.querySelectorAll('ul > li:not(.none)')]
                .map(li => (li.textContent || '').trim())
                .filter(t => t && t !== NONE_TEXT);
            if (title && items.length) parts.push(title + '.');
            items.forEach(s => parts.push(s.endsWith('.') ? s : s + '.'));
        });

        const text = parts.join(' ').trim() || '내용이 없습니다.';
        TTS.speak(text, { voiceName: btn.dataset.voice || undefined });
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') TTS.stop(); });
})();
