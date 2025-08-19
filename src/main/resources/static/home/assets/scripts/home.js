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

if (nextBtn) {
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
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (offset + moveDistance < 0) {
            offset += moveDistance;
        } else {
            offset = 0; // 처음 위치로 맞추기
        }
        $list.style.transform = `translateX(${offset}px)`;
    });
}

let showCaption = true;

// 초기 상태: 캡션 보이기
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
            showEmptyMessage('저장된 알람이 없습니다. MYPAGE에서 복지 알람을 등록해보세요.');
            return;
        }

        const response = JSON.parse(xhr.responseText);

        // 응답이 null이거나 빈 배열인 경우
        if (!response || response.length === 0) {
            showEmptyMessage('저장된 알람이 없습니다. MYPAGE에서 복지 알람을 등록해보세요.');
            return;
        }

        let $listHTML = ``;
        for (const item of response) {
            // D+/- 계산
            const today = new Date();
            const alarmDate = new Date(item['alarmAt']);
            const timeDiff = alarmDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            // statusText에 클래스 추가
            let statusClass = '';
            let statusText = '';
            if (daysDiff < 0) {
                statusText = `${Math.abs(daysDiff)}일 지남`;
                statusClass = 'past';      // 파랑색
            } else if (daysDiff === 0) {
                statusText = `오늘`;
                statusClass = 'today';     // 초록색
            } else {
                statusText = `${daysDiff}일 남음`;
                statusClass = 'future';    // 빨강색
            }

            // HTML에 클래스 추가
            $listHTML += `
                    <li class="item">
                        <a href="/welfare/detail?id=${item['welfareId']}" class="link">
                            <span class="text title">${item['welfareName']}</span>
                            <span class="text ministry"><span class="label">부처 :</span> ${item['ministryName'] || '정보 없음'}</span>
                            <span class="text summary"><span class="label">요약 :</span> ${item['summary'] || '정보 없음'}</span>
                            <span class="text cycle"><span class="label">지원주기 :</span> ${item['supportCycle'] || '정보 없음'}</span>
                            <span role="none" data-aeo-stretch></span>
                            <div class="day-box">
                                <span class="day"><span class="label">알람 :</span> ${item['alarmAt']}</span>
                                <span class="day-text ${statusClass}">${statusText}</span>
                            </div>
                        </a>
                    </li>
                `;
        }

        // 기존 empty 메시지 제거하고 실제 알람 데이터 표시
        clearEmptyMessage();
        $list.innerHTML = $listHTML;

        // 아이템 개수에 따라 버튼 표시/숨김 및 레이아웃 조정
        if (response.length >= 4) {
            // 4개 이상일 때: 버튼 표시, 좌측 정렬
            if (prevBtn) prevBtn.style.display = 'block';
            if (nextBtn) nextBtn.style.display = 'block';
            $list.style.justifyContent = 'flex-start';
            $sliderWrapper.style.justifyContent = 'flex-start';
            $list.style.paddingLeft = '0';
            $sliderWrapper.style.padding = '0';
            $list.style.marginLeft = '0'; // 슬라이더 모드에서는 margin 제거
        } else {
            // 3개 이하일 때: 버튼 숨김, 중앙 정렬
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            $list.style.justifyContent = 'center';
            $sliderWrapper.style.justifyContent = 'center';
            $list.style.paddingLeft = '1rem';
            $sliderWrapper.style.padding = '0 1rem';
            $list.style.marginLeft = '2rem'; // 중앙 정렬 모드에서는 margin 유지
        }
    };

    xhr.open('GET', '/api/home/alarmList');
    xhr.setRequestHeader(header, token);
    xhr.send();
};

// 빈 상태 메시지 표시 함수
function showEmptyMessage(message) {
    clearEmptyMessage();

    // prevBtn과 nextBtn 숨기기
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    // 레이아웃 중앙 정렬
    $list.style.justifyContent = 'center';
    $sliderWrapper.style.justifyContent = 'center';

    const emptyHTML = `
        <div class="empty-message">
            <span class="caption">알람 등록 서비스</span>
            <span class="content">${message}</span>
        </div>
    `;

    $alarmContainer.insertAdjacentHTML('beforeend', emptyHTML);
}

// 빈 상태 메시지 제거 함수
function clearEmptyMessage() {
    const existingEmpty = $alarmContainer.querySelector('.empty-message');
    if (existingEmpty) {
        existingEmpty.remove();
    }

    // prevBtn과 nextBtn 다시 보이기
    if (prevBtn) prevBtn.style.display = 'block';
    if (nextBtn) nextBtn.style.display = 'block';
}

loadAlarmData();