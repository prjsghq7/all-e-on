(() => {
    // 서버 TTS 설정
    const TTS_ENDPOINT = '/api/tts';
    const DEFAULT_VOICE = 'ko-KR-Wavenet-A';
    const DEFAULT_LANG  = 'ko-KR';

    // CSRF 메타에서 읽기
    const getCsrf = () => {
        const t = document.querySelector('meta[name="_csrf"]')?.content;
        const h = document.querySelector('meta[name="_csrf_header"]')?.content;
        return (t && h) ? { header: h, token: t } : null;
    };

    // Web Speech 폴백 준비
    let voices = [];
    const loadVoices = () => { voices = (window.speechSynthesis?.getVoices() || []); };
    if ('speechSynthesis' in window) {
        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    const pickKo = () => {
        if (!voices || voices.length === 0) return null;
        return voices.find(v => /^ko([-_]|$)/i.test(v.lang)) || voices.find(v => /ko/i.test(v.lang)) || null;
    };

    const TTS = {
        _audio: null,
        _u: null,

        async speak(text, opts = {}) {
            if (!text || !text.trim()) return;
            this.stop();

            // 1) 서버 TTS (CSRF 포함)
            try {
                const payload = {
                    text: text.trim(),
                    languageCode: DEFAULT_LANG,
                    voiceName: opts.voiceName || DEFAULT_VOICE,
                    speakingRate: (typeof opts.rate === 'number') ? opts.rate : 1.0,
                    pitch: (typeof opts.pitch === 'number') ? opts.pitch : 0.0,
                    audioEncoding: 'MP3',
                    useSsml: !!opts.useSsml
                };

                const headers = { 'Content-Type': 'application/json' };
                const csrf = getCsrf();
                if (csrf) headers[csrf.header] = csrf.token;

                const res = await fetch(TTS_ENDPOINT, {
                    method: 'POST',
                    headers,
                    credentials: 'same-origin',
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('TTS HTTP ' + res.status);

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                const audio = new Audio(url);
                audio.onended = () => {
                    URL.revokeObjectURL(url);
                    if (this._audio === audio) this._audio = null;
                };
                this._audio = audio;
                await audio.play();
                return; // 서버 TTS 성공
            } catch (err) {
                console.warn('[TTS] server synth failed, fallback to Web Speech:', err);
            }

            // 2) 폴백: Web Speech
            if ('speechSynthesis' in window) {
                try { speechSynthesis.cancel(); } catch {}
                const u = new SpeechSynthesisUtterance(text);
                u.lang = DEFAULT_LANG;
                const v = pickKo();
                if (v) u.voice = v;
                u.rate = 1; u.pitch = 1; u.volume = 1;
                this._u = u;
                speechSynthesis.speak(u);
            } else {
                console.error('[TTS] No available TTS (server & browser both failed).');
            }
        },

        stop() {
            if (this._audio) {
                try {
                    this._audio.pause();
                    URL.revokeObjectURL(this._audio.src);
                } catch {}
                this._audio = null;
            }
            if ('speechSynthesis' in window) {
                try { speechSynthesis.cancel(); } catch {}
            }
            this._u = null;
        }
    };

    window.TTS = TTS;

    // 카드 개별 읽기(.tts 유지)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.tts');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest('.welfare');
        if (!card) return;

        const txt = (sel) => (card.querySelector(sel)?.textContent || '').trim();
        const name = txt('.name');
        const sub = txt('.sub');
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

        TTS.speak(parts.join(' '));
    });

    // ESC 키로 중지
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') TTS.stop();
    });
})();
