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

const moveDistance = remToPx(66); // slider-wrapper 크기와 같게

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
    showCaption=!showCaption;
    $contentContainer.classList.toggle('show-caption', showCaption);
    $contentContainer.classList.toggle('show-content', !showCaption);
}, 2000);

