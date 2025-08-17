// /welfare/assets/scripts/detail-tts.js
(() => {
    const TTS_ENDPOINT = '/api/tts';
    const DEFAULT_VOICE = 'ko-KR-Wavenet-A';
    const DEFAULT_LANG  = 'ko-KR';

    const getCsrf = () => {
        const t = document.querySelector('meta[name="_csrf"]')?.content;
        const h = document.querySelector('meta[name="_csrf_header"]')?.content;
        return (t && h) ? { header: h, token: t } : null;
    };

    const TTS = {
        _audio: null,
        _ac: null,
        _seq: 0,
        _isFetching: false,
        _isPlaying: false,
        _currentBtn: null,

        isPlaying() { return this._isPlaying; },

        stop() {
            if (this._audio) {
                try { this._audio.pause(); URL.revokeObjectURL(this._audio.src); } catch {}
                this._audio = null;
            }
            if (this._ac) { try { this._ac.abort(); } catch {} this._ac = null; }
            this._isFetching = false;
            this._isPlaying = false;
            this._seq++;
            if (this._currentBtn) { this._currentBtn.classList.remove('is-speaking'); this._currentBtn = null; }
        },

        async speak(text, opts = {}) {
            const s = (text || '').trim();
            if (!s) return;

            const mySeq = ++this._seq;
            this._isFetching = true;

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
            } catch {
                // Web Speech 폴백 없음
                this._isFetching = false;
                return;
            }

            if (mySeq !== this._seq) { this._isFetching = false; return; }

            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            this._audio = audio;
            this._isFetching = false;
            this._isPlaying = true;

            audio.onended = () => {
                URL.revokeObjectURL(url);
                if (this._audio === audio) this._audio = null;
                this._isPlaying = false;
                if (this._currentBtn) { this._currentBtn.classList.remove('is-speaking'); this._currentBtn = null; }
            };
            audio.onerror = () => {
                URL.revokeObjectURL(url);
                this._isPlaying = false;
                if (this._currentBtn) { this._currentBtn.classList.remove('is-speaking'); this._currentBtn = null; }
            };

            try { await audio.play(); }
            catch { this.stop(); }
        }
    };

    window.TTS = TTS;

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.tts');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        // 같은 버튼을 재클릭하면 토글: 정지
        if ((TTS._isPlaying || TTS._isFetching) && TTS._currentBtn === btn) {
            TTS.stop();
            return;
        }

        // 다른 버튼을 누르면 현재 재생 중단 후 새로 시작
        if (TTS._isPlaying || TTS._isFetching) {
            TTS.stop();
        }

        const card = btn.closest('.welfare');
        if (!card) return;

        const txt = (sel) => (card.querySelector(sel)?.textContent || '').trim();
        const name = txt('.name');
        const sub  = txt('.sub');
        const desc = txt('.description');
        const i1 = txt('.footer .info:nth-of-type(1)');
        const i2 = txt('.footer .info:nth-of-type(2)');
        const i3 = txt('.footer .info:nth-of-type(3)');
        const tags = Array.from(card.querySelectorAll('.tooltip .tag'))
            .map(t => (t.textContent || '').trim()).filter(Boolean);

        const parts = [];
        if (name) parts.push(`${name}.`);
        if (sub) parts.push(`${sub}.`);
        if (desc) parts.push(`${desc}.`);
        if (i1) parts.push(`${i1}.`);
        if (i2) parts.push(`${i2}.`);
        if (i3) parts.push(`${i3}.`);
        if (tags.length) parts.push(`관련 태그: ${tags.join(', ')}.`);

        const text = parts.join(' ').trim();
        if (!text) return;

        TTS._currentBtn = btn;
        btn.classList.add('is-speaking');
        TTS.speak(text);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') TTS.stop();
    });
})();
