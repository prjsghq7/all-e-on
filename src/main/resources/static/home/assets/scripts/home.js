const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

const $alarmContainer = document.querySelector('.alarm-container');
const $sliderWrapper = $alarmContainer.querySelector('.slider-wrapper');
const $list = $sliderWrapper.querySelector('.list');
const nextBtn = $alarmContainer.querySelector('.nextBtn');
const prevBtn = $alarmContainer.querySelector('.prevBtn');
const $defaultArea = document.getElementById('defaultArea');
const $contentContainer = $defaultArea.querySelector(':scope>.alarm-sec>.introduce-container>.content-container');
const $conCaption = $contentContainer.querySelector(':scope>.caption');
const $conContent = $contentContainer.querySelector(':scope>.content');

let offset = 0;

function remToPx(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const moveDistance = remToPx(67); // slider-wrapper 크기와 같게

function getMaxOffset() {
    return -($list.scrollWidth - $sliderWrapper.clientWidth);
}

nextBtn.addEventListener('click', () => {
    const maxOffset = getMaxOffset();

    // 다음으로 이동한 위치가 maxOffset보다 크면 정상 이동
    if (offset - moveDistance > maxOffset) {
        offset -= moveDistance;
    } else {
        offset = maxOffset; // 마지막 칸 정확히 맞추기
    }

    $list.style.transform = `translateX(${offset}px)`;
});

prevBtn.addEventListener('click', () => {
    if (offset + moveDistance < 0) {
        offset += moveDistance;
    } else {
        offset = 0; // 처음 위치로 맞추기
    }

    $list.style.transform = `translateX(${offset}px)`;
});

let showCaption = true;

// // 초기 상태: 캡션 보이기
$contentContainer.classList.add('show-caption');
setInterval(() => {
    showCaption = !showCaption;
    $contentContainer.classList.toggle('show-caption', showCaption);
    $contentContainer.classList.toggle('show-content', !showCaption);
}, 2000);


const loadAlarmData = () => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
            alert('알람 데이터를 불러오는데 실패했습니다.');
            return;
        }

        const response = JSON.parse(xhr.responseText);
        let $listHTML = ``;
        for (const item of response) {
            // D+/- 계산
            const today = new Date();
            const alarmDate = new Date(item.alarmAt);
            const timeDiff = alarmDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

// statusText에 클래스 추가
            let statusClass = '';
            let statusText = '';
            if (daysDiff < 0) {
                statusText = `${Math.abs(daysDiff)}일 전`;
                statusClass = 'past';      // 파랑색
            } else if (daysDiff === 0) {
                statusText = '오늘';
                statusClass = 'today';     // 초록색
            } else {
                statusText = `${daysDiff}일 후`;
                statusClass = 'future';    // 빨강색
            }

// HTML에 클래스 추가
            $listHTML += `
                    <li class="item">
                        <a href="#" class="link">
                            <span class="text title">${item.welfareName}</span>
                            <span class="text ministry"><span class="label">부처 :</span> ${item.ministryName}</span>
                            <span class="text summary"><span class="label">요약 :</span> ${item.summary}</span>
                            <span class="text cycle"><span class="label">지원주기 :</span> ${item.supportCycle}</span>
                            <span role="none" data-aeo-stretch></span>
                            <div class="day-box">
                                <span class="day"><span class="label">알람 :</span> ${item.alarmAt}</span>
                                <span class="day-text ${statusClass}">${statusText}</span>
                            </div>
                        </a>
                    </li>
                `;
        }

        // TODO
        // 로그인 처리
        // null 처리
        // order by 처리
        // 날짜 limit 처리
        $list.innerHTML += $listHTML;
    };

    xhr.open('GET', '/api/home/alarmList');  // 기존 API 엔드포인트 사용
    xhr.setRequestHeader(header, token);
    xhr.send();
};

loadAlarmData();