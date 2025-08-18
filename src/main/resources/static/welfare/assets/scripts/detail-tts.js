// /welfare/assets/scripts/detail-tts.js
(() => {
    const TTS_ENDPOINT = '/api/tts';
    const DEFAULT_VOICE = 'ko-KR-Wavenet-A';
    const DEFAULT_LANG  = 'ko-KR';
    const NONE_TEXT     = '등록된 데이터 정보가 없습니다.';

    const getCsrf = () => {
        const t = document.querySelector('meta[name="_csrf"]')?.content;
        const h = document.querySelector('meta[name="_csrf_header"]')?.content;
        return (t && h) ? { header: h, token: t } : null;
    };

    // 버튼 UI 상태 (아이콘/캡션 토글)
    const setBtnState = (btn, speaking) => {
        if (!btn) return;
        btn.classList.toggle('is-speaking', !!speaking);
        btn.setAttribute('aria-pressed', speaking ? 'true' : 'false');

        const capSpeak  = btn.querySelector('.caption.speak');
        const capCancel = btn.querySelector('.caption.cancel');
        if (!capSpeak && !capCancel) {
            const cap = btn.querySelector('.caption');
            if (cap) cap.textContent = speaking ? '중지' : '음성안내';
        }
    };

    // 섹션에 실제 읽을 항목이 있는지
    const sectionHasRealItems = (sectionEl) => {
        return [...sectionEl.querySelectorAll('.detail-explain ul > li:not(.none)')]
            .map(li => (li.textContent || '').trim())
            .some(t => t && t !== NONE_TEXT);
    };

    // 타이틀 영역 텍스트(h2 + 요약 span)
    const buildTextForTitle = (titleEl) => {
        if (!titleEl) return '';
        const name = titleEl.querySelector('h2')?.textContent?.trim();
        // 타이틀 바로 다음 설명 span
        const desc = titleEl.querySelector(':scope > span')?.textContent?.trim();
        const parts = [];
        if (name) parts.push(name + '.');
        if (desc) parts.push(desc.endsWith('.') ? desc : desc + '.');
        return parts.join(' ').trim();
    };

    // 섹션 텍스트(h3 + li들)
    const buildTextForSection = (section) => {
        if (!section) return '';
        const parts = [];
        section.querySelectorAll('.detail-explain').forEach(sec => {
            const title = sec.querySelector('h3')?.textContent?.trim();
            const items = [...sec.querySelectorAll('ul > li:not(.none)')]
                .map(li => (li.textContent || '').trim())
                .filter(t => t && t !== NONE_TEXT);

            if (title && items.length) parts.push(title + '.');
            items.forEach(s => parts.push(s.endsWith('.') ? s : s + '.'));
        });
        return parts.join(' ').trim() || '내용이 없습니다.';
    };

    // TTS 본체
    const TTS = {
        _audio: null,
        _ac: null,
        _seq: 0,
        _isFetching: false,
        _isPlaying: false,
        _currentBtn: null,

        isBusy() { return this._isFetching || this._isPlaying; },

        stop() {
            this._seq++;
            if (this._audio) {
                try { this._audio.pause(); URL.revokeObjectURL(this._audio.src); } catch {}
                this._audio = null;
            }
            if (this._ac) { try { this._ac.abort(); } catch {} this._ac = null; }
            this._isFetching = false;
            this._isPlaying  = false;

            if (this._currentBtn) {
                setBtnState(this._currentBtn, false);
                this._currentBtn = null;
            }
        },

        async start(text, btn, opts = {}) {
            const s = (text || '').trim();
            if (!s || !btn) return;

            const mySeq = ++this._seq;
            this._isFetching = true;
            this._currentBtn = btn;
            setBtnState(btn, true); // 즉시 cancel 아이콘/캡션 표시

            const payload = {
                text: s,
                languageCode: DEFAULT_LANG,
                voiceName: opts.voiceName || DEFAULT_VOICE,
                speakingRate: typeof opts.rate === 'number' ? opts.rate : 1.0,
                pitch:        typeof opts.pitch === 'number' ? opts.pitch : 0.0,
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
                if (mySeq === this._seq) {
                    this._isFetching = false;
                    setBtnState(btn, false);
                    this._currentBtn = null;
                }
                return;
            }

            if (mySeq !== this._seq) return; // 최신 요청만 유지

            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            this._audio = audio;
            this._isFetching = false;
            this._isPlaying  = true;

            const cleanup = () => {
                URL.revokeObjectURL(url);
                this._isPlaying = false;
                if (this._audio === audio) this._audio = null;
                if (this._currentBtn) {
                    setBtnState(this._currentBtn, false);
                    this._currentBtn = null;
                }
            };

            audio.onended = cleanup;
            audio.onerror = cleanup;

            try { await audio.play(); }
            catch { this.stop(); }
        }
    };

    // 빈 섹션의 .tts 비활성화
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.content[data-mt-radio] > .tts').forEach(btn => {
            const section = btn.closest('.content[data-mt-radio]');
            if (section && !sectionHasRealItems(section)) {
                btn.setAttribute('disabled','');
                btn.setAttribute('aria-disabled','true');
            }
        });

        // 초기 aria-pressed 기본값 보장
        document.querySelectorAll('.tts').forEach(btn => {
            if (!btn.hasAttribute('aria-pressed')) {
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    });

    // 클릭 핸들러: 타이틀 버튼과 섹션 버튼 둘 다 처리
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.tts');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        if (btn.hasAttribute('disabled')) return;

        // 같은 버튼을 다시 누르면 즉시 정지 (cancel 아이콘 동작)
        if (TTS.isBusy() && TTS._currentBtn === btn) {
            TTS.stop();
            return;
        }

        // 다른 버튼 누르면 기존 재생 중단 후 계속
        if (TTS.isBusy() && TTS._currentBtn && TTS._currentBtn !== btn) {
            TTS.stop();
        }

        // 어디에 있는 버튼인지 판별
        const titleBox  = btn.closest('.title');                   // 상단 타이틀 영역
        const sectionEl = btn.closest('.content[data-mt-radio]');  // 하단 섹션 영역

        let text = '';
        if (titleBox) {
            text = buildTextForTitle(titleBox);
        } else if (sectionEl) {
            text = buildTextForSection(sectionEl);
        } else {
            return; // 둘 다 아니면 처리 안 함
        }

        if (!text) return;

        const voice = btn.dataset.voice || undefined;
        TTS.start(text, btn, { voiceName: voice });
    });

    // ESC로 정지
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') TTS.stop();
    });
})();
