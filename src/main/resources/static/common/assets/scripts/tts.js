// ───────────────────────── 1) 브라우저가 가진 음성(Voice) 목록 보관
let voices = [];
// 전역 배열. 실제 음성은 브라우저가 비동기로 로딩한다(특히 Chrome).
// 그래서 아래 loadVoices()가 여러 번 호출될 수 있음.

// ───────────────────────── 2) 음성 목록을 실제로 채우는 함수
const loadVoices = () => {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    // getVoices()는 "지금 시점"에 로딩된 음성 배열을 반환.
    // 초기에는 []일 수 있음(브라우저가 아직 안 가져왔기 때문).
    // 그래서 onvoiceschanged에서 한 번 더 호출해준다(아래 참고).
};

loadVoices();
// 페이지 로드 직후 한 번 시도. 이 순간엔 빈 배열일 수도 있음.

if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.onvoiceschanged = loadVoices;
    // Chrome/Safari 등은 음성이 준비되면 이 이벤트가 발생.
    // 여기서 다시 loadVoices() 돌리면 voices 배열이 실제로 채워짐.
    // 결과: voice가 늦게 와도 한국어 보이스 선택이 결국 성공함.
}

// ───────────────────────── 3) 한국어 보이스 하나 고르기 (엄격 -> 느슨)
const pickKoreanVoice = () => {
    if (!voices || voices.length === 0) return null;
    // 아직 로딩 전이면 null 반환. (그 경우엔 브라우저 기본 보이스로 재생)

    const strict = voices.find(v => /^ko(-|_)?/i.test(v.lang));
    // ko-KR, ko_KR 같은 "정확한" 한국어 우선.

    if (strict) return strict;

    const loose = voices.find(v => /ko/i.test(v.lang));
    // 혹시 언어 코드가 특이하게 들어온 케이스 대비. (예: "ko"만 있는 등)
    return loose || null;
    // 결국 못 찾으면 null (그럼 speak에서 voice를 지정하지 않음 = 기본 보이스 사용)
};

// ───────────────────────── 4) 재생 상태와 동작을 묶은 컨트롤러 객체
const TTS = {
    currentBtn: null,   // 지금 "읽는 중" 상태로 표시한 버튼(토글/스타일용)
    currentUtter: null, // 지금 실제로 말하고 있는 Utterance 객체

    speak(text, btn, opts) {
        this.stop(); // 먼저 이전 재생(큐 포함)을 모두 끊는다. (중복 재생, 겹침 방지)

        const utter = new SpeechSynthesisUtterance(text); // 읽을 문장 묶음
        utter.lang = (opts && opts.lang) || 'ko-KR';      // 언어: 기본 한국어

        const v = pickKoreanVoice(); // 가능한 한국어 보이스 가져오기
        if (v) utter.voice = v;      // 있으면 지정, 없으면 브라우저 기본으로 감

        // 재생 파라미터(속도/피치/볼륨) — 전달 안 되면 기본 1
        utter.rate   = (opts && opts.rate)   != null ? opts.rate   : 1;
        utter.pitch  = (opts && opts.pitch)  != null ? opts.pitch  : 1;
        utter.volume = (opts && opts.volume) != null ? opts.volume : 1;

        // 재생이 끝나거나 에러 났을 때 버튼 상태/참조 정리
        utter.onend   = () => this.clear(btn);
        utter.onerror = () => this.clear(btn);

        // 현재 상태 보관(나중에 stop/clear 할 때 필요)
        this.currentBtn   = btn;
        this.currentUtter = utter;

        // UI 상태 표시(네가 CSS로 .tts[data-tts-playing="true"] 스타일 줄 수 있게)
        btn.setAttribute('data-tts-playing', 'true');

        // 실제 재생 (브라우저 큐에 들어가고 즉시/순차 재생)
        window.speechSynthesis.speak(utter);
        // 참고: speak()는 재생 큐에 넣는다. 위에서 stop()을 먼저 쳐서 이전 큐는 비워둔 상태.
    },

    stop() {
        if (this.currentUtter) {
            try { window.speechSynthesis.cancel(); } catch (_) {}
            // cancel()은 현재/대기 중 전부 취소. (여러 번 눌러도 안전)
        }
        this.clear(this.currentBtn);
        // 버튼에 붙었던 data-속성 제거 + 참조 초기화
    },

    clear(btn) {
        if (btn) btn.removeAttribute('data-tts-playing');
        // "읽는 중" 상태 뱃지/스타일 해제

        this.currentBtn = null;
        this.currentUtter = null;
        // 재생 참조 초기화 (메모리/논리 상태 모두 idle로)
    }
};

// ───────────────────────── 5) DOM에서 텍스트 뽑는 유틸(없으면 빈 문자열)
const txt = (el, sel) => {
    const node = el.querySelector(sel);
    return node ? (node.textContent || '').trim() : '';
    // 요소가 없거나 textContent가 null이어도 안전하게 '' 반환.
};

// ───────────────────────── 6) 카드 하나를 "읽을 한 문장"으로 합치기
const buildTextFromCard = (card) => {
    // 필요 텍스트들 선택자 기준으로 수집
    const name = txt(card, '.name');           // 제목
    const sub = txt(card, '.sub');             // 기관/부서 등 부제
    const desc = txt(card, '.description');    // 요약/설명

    const footer = card.querySelector('.footer');
    const srv   = footer ? txt(footer, '.info:nth-of-type(1)') : ''; // 지원 대상/내용
    const cycle = footer ? txt(footer, '.info:nth-of-type(2)') : ''; // 신청/지급 주기
    const online= footer ? txt(footer, '.info:nth-of-type(3)') : ''; // 온라인 여부

    // 태그들 모으기 (.tooltip .tag 안의 텍스트)
    const tags = [];
    card.querySelectorAll('.tooltip .tag').forEach(t => {
        const v = (t.textContent || '').trim();
        if (v) tags.push(v);
    });

    // 읽을 순서 = 배열 순서. 끝에 '.' 붙여서 TTS가 적당히 끊어 읽게 유도.
    const parts = [];
    if (name)  parts.push(`${name}.`);
    if (sub)   parts.push(`${sub}.`);
    if (desc)  parts.push(`${desc}.`);
    if (srv)   parts.push(`${srv}.`);
    if (cycle) parts.push(`${cycle}.`);
    if (online)parts.push(`${online}.`);
    if (tags.length) parts.push(`관련 태그: ${tags.join(', ')}.`);

    return parts.join(' ');
    // 최종은 하나의 긴 문자열.
    // 쉼표/마침표가 많을수록 브라우저가 더 또박또박 끊어 읽는 경향이 있음.
};

// ───────────────────────── 7) 문서 어디서든 .tts 버튼 클릭 → 카드 읽기/중지 토글
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tts');
    if (!btn) return; // .tts 아닌 클릭은 무시

    e.preventDefault();   // 버튼/링크의 기본 동작 막기(스크롤, 이동 등)
    e.stopPropagation();  // 상위로 이벤트 안 올리게 (카드 클릭 핸들러와 충돌 방지)

    // 이미 이 버튼으로 "읽는 중"이면 → 중지(토글)
    if (btn.getAttribute('data-tts-playing') === 'true') {
        TTS.stop();
        return;
    }

    // 어떤 카드를 읽을지: 이 버튼이 속한 .welfare 카드 컨테이너
    const card = btn.closest('.welfare');
    if (!card) return; // 예상 구조가 아니면 아무 것도 안 함 (안전장치)

    // 카드에서 읽을 텍스트 만들어오기
    const text = buildTextFromCard(card);
    if (!text) return; // 비어있으면 재생할 필요 없음

    // 실제 재생. 옵션은 여기서 조정(속도/피치/볼륨/언어)
    TTS.speak(text, btn, { lang: 'ko-KR', rate: 1, pitch: 1, volume: 1 });
});

// ───────────────────────── 8) 페이지 떠날 때 재생 중이면 끊기(깔끔한 정리)
window.addEventListener('beforeunload', () => {
    try { window.speechSynthesis.cancel(); } catch (_) {}
    // 새로고침/페이지 이동 시에 스피커 계속 울리는 거 방지.
});
