const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

const $favoriteSection = document.getElementById('favorite-section');
const $list = $favoriteSection.querySelector(`:scope > .favorite-container > .favorite-list`);

let date = new Date();
let markedDates = []; // 마크된 날짜들을 저장할 배열
let selectedDate = null; // 현재 선택된 날짜

// 즐겨찾기된 복지 서비스 목록 (임의 데이터)
let favoriteServices = [
    {id: 1, name: '기초생활수급자', category: '생활지원', description: '최저생활을 보장하기 위한 수급자 선정 및 급여 지급'},
    {id: 2, name: '장애인연금', category: '연금지원', description: '장애인에게 지급되는 연금으로 생활안정 지원'},
    {id: 3, name: '한부모가족지원', category: '가족지원', description: '한부모가족의 생활안정과 복지증진을 위한 지원'},
    {id: 4, name: '국민기초생활보장', category: '생활지원', description: '생활이 어려운 사람에게 필요한 급여를 제공'},
    {id: 5, name: '장애인활동지원', category: '활동지원', description: '장애인의 자립생활 및 사회활동 참여 지원'},
    {id: 6, name: '아동수당', category: '아동지원', description: '만 8세 이하 아동을 양육하는 가정에 지급'},
    {id: 7, name: '출산장려금', category: '출산지원', description: '출산을 장려하기 위한 지원금 지급'},
    {id: 8, name: '주거급여', category: '주거지원', description: '주거가 어려운 사람에게 주거비용 지원'},
];

// 즐겨찾기한 복지 서비스 목록 (임의 데이터)
let favoritedWelfareServices = [
    {
        id: 1,
        name: '기초생활수급자',
        category: '생활지원',
        description: '최저생활을 보장하기 위한 수급자 선정 및 급여 지급',
        amount: '월 1,200,000원',
        status: '신청완료'
    },
    {
        id: 2,
        name: '장애인연금',
        category: '연금지원',
        description: '장애인에게 지급되는 연금으로 생활안정 지원',
        amount: '월 800,000원',
        status: '승인완료'
    },
    {
        id: 3,
        name: '한부모가족지원',
        category: '가족지원',
        description: '한부모가족의 생활안정과 복지증진을 위한 지원',
        amount: '월 500,000원',
        status: '심사중'
    },
    {
        id: 4,
        name: '아동수당',
        category: '아동지원',
        description: '만 8세 이하 아동을 양육하는 가정에 지급',
        amount: '월 300,000원',
        status: '지급중'
    },
    {
        id: 5,
        name: '출산장려금',
        category: '출산지원',
        description: '출산을 장려하기 위한 지원금 지급',
        amount: '1회 2,000,000원',
        status: '신청완료'
    },
    {
        id: 6,
        name: '한부모가족지원',
        category: '가족지원',
        description: '한부모가족의 생활안정과 복지증진을 위한 지원',
        amount: '월 500,000원',
        status: '심사중'
    },
    {
        id: 7,
        name: '아동수당',
        category: '아동지원',
        description: '만 8세 이하 아동을 양육하는 가정에 지급',
        amount: '월 300,000원',
        status: '지급중'
    },
];

// Controller나 DB에서 받아올 데이터를 시뮬레이션하는 임의의 날짜들 (한 날짜에 여러 건 포함)
const initializeMarkedDates = () => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert(`[${xhr.status}] 알림 목록을 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.`);
            return;
        }

        const response = JSON.parse(xhr.responseText);
        console.log('response:', response);

        // DB에서 받은 알림 데이터로 markedDates 배열 초기화
        markedDates = []; // 배열 초기화

        for (const alarm of response) {
            const dateParts = alarm['alarmAt'].split('-');

            markedDates.push({
                year: parseInt(dateParts[0]),
                month: parseInt(dateParts[1]),
                day: parseInt(dateParts[2]),
                welfareId: alarm['welfareId'],
                title: alarm['welfareName'],        // 복지 서비스명
                type: alarm['ministryName'],        // 부처명
                summary: alarm['summary'],          // 요약 정보
                supportCycle: alarm['supportCycle'], // 지원주기 추가
                lifeArray: alarm['lifeArray']       // 생애 주기 추가
            });
        }

        console.log('markedDates:', markedDates);

        // 데이터 로딩 완료 후 UI 업데이트
        renderCalender();
        updateMarkedList();
    };

    xhr.open('GET', `/welfare/alarmList`);
    xhr.setRequestHeader(header, token);
    xhr.send();
};

/*// Controller나 DB에서 받아올 데이터를 시뮬레이션하는 임의의 날짜들 (한 날짜에 여러 건 포함)
const initializeMarkedDates = () => {
    markedDates = [
        {
            year: 2024,
            month: 12,
            day: 15,
            type: '복지 서비스 신청일',
            title: '기초생활수급자 신청',
            description: '기초생활수급자 자격 신청을 위한 서류 제출',
            status: '완료',
            amount: '월 1,200,000원',
            documents: ['신분증 사본', '소득증빙서류', '재산증빙서류'],
            notes: '신청 후 15일 이내 심사 예정'
        },
        {
            year: 2024,
            month: 12,
            day: 15,
            type: '장애인연금 신청일',
            title: '장애인연금 신청',
            description: '장애인연금 신청을 위한 서류 제출',
            status: '신청',
            amount: '월 800,000원',
            documents: ['장애진단서', '소득증빙서류'],
            notes: '장애등급 1-3급 대상'
        },
        {
            year: 2024,
            month: 12,
            day: 20,
            type: '서류 심사일',
            title: '기초생활수급자 심사',
            description: '제출된 서류에 대한 심사 및 검토',
            status: '진행중',
            amount: '월 1,200,000원',
            documents: ['소득조사서', '재산조사서'],
            notes: '추가 서류 요청 가능'
        },
        {
            year: 2024,
            month: 12,
            day: 20,
            type: '장애인연금 심사일',
            title: '장애인연금 심사',
            description: '장애인연금 자격 심사',
            status: '심사중',
            amount: '월 800,000원',
            documents: ['장애정도 재심사'],
            notes: '의료기관 재검진 필요'
        },
        {
            year: 2024,
            month: 12,
            day: 25,
            type: '승인일',
            title: '기초생활수급자 승인',
            description: '기초생활수급자 자격 승인 및 통지',
            status: '승인',
            amount: '월 1,200,000원',
            documents: ['승인통지서'],
            notes: '2025년 1월부터 지급 시작'
        },
        {
            year: 2024,
            month: 12,
            day: 25,
            type: '장애인연금 승인일',
            title: '장애인연금 승인',
            description: '장애인연금 자격 승인',
            status: '승인',
            amount: '월 800,000원',
            documents: ['승인통지서'],
            notes: '2025년 2월부터 지급'
        },
        {
            year: 2024,
            month: 12,
            day: 28,
            type: '지급일',
            title: '기초생활수급자 지급',
            description: '기초생활수급자 수급금 지급',
            status: '완료',
            amount: '월 1,200,000원',
            documents: ['지급내역서'],
            notes: '매월 25일 지급 예정'
        },
        {
            year: 2024,
            month: 12,
            day: 28,
            type: '장애인연금 지급일',
            title: '장애인연금 지급',
            description: '장애인연금 수급금 지급',
            status: '완료',
            amount: '월 800,000원',
            documents: ['지급내역서'],
            notes: '매월 25일 지급'
        },
        {
            year: 2025,
            month: 1,
            day: 5,
            type: '다음 달 신청일',
            title: '한부모가족지원 신청',
            description: '한부모가족지원금 신청',
            status: '신청',
            amount: '월 500,000원',
            documents: ['가족관계증명서', '소득증빙서류'],
            notes: '18세 미만 자녀가 있는 한부모 대상'
        },
        {
            year: 2025,
            month: 1,
            day: 12,
            type: '다음 달 심사일',
            title: '한부모가족지원 심사',
            description: '한부모가족지원 자격 심사',
            status: '심사중',
            amount: '월 500,000원',
            documents: ['소득조사서'],
            notes: '소득 기준 확인 중'
        },
        {
            year: 2025,
            month: 1,
            day: 18,
            type: '다음 달 승인일',
            title: '한부모가족지원 승인',
            description: '한부모가족지원 자격 승인',
            status: '승인',
            amount: '월 500,000원',
            documents: ['승인통지서'],
            notes: '2025년 3월부터 지급'
        },
        {
            year: 2025,
            month: 1,
            day: 25,
            type: '다음 달 지급일',
            title: '한부모가족지원 지급',
            description: '한부모가족지원금 지급',
            status: '완료',
            amount: '월 500,000원',
            documents: ['지급내역서'],
            notes: '매월 25일 지급'
        },
        {
            year: 2025,
            month: 2,
            day: 25,
            type: '승인일',
            title: '기초생활수급자 승인',
            description: '기초생활수급자 자격 승인 및 통지',
            status: '승인',
            amount: '월 1,200,000원',
            documents: ['승인통지서'],
            notes: '2025년 1월부터 지급 시작'
        },
        {
            year: 2025,
            month: 3,
            day: 25,
            type: '장애인연금 승인일',
            title: '장애인연금 승인',
            description: '장애인연금 자격 승인',
            status: '승인',
            amount: '월 800,000원',
            documents: ['승인통지서'],
            notes: '2025년 2월부터 지급'
        },
        {
            year: 2025,
            month: 4,
            day: 28,
            type: '지급일',
            title: '기초생활수급자 지급',
            description: '기초생활수급자 수급금 지급',
            status: '완료',
            amount: '월 1,200,000원',
            documents: ['지급내역서'],
            notes: '매월 25일 지급 예정'
        },
        {
            year: 2025,
            month: 5,
            day: 28,
            type: '장애인연금 지급일',
            title: '장애인연금 지급',
            description: '장애인연금 수급금 지급',
            status: '완료',
            amount: '월 800,000원',
            documents: ['지급내역서'],
            notes: '매월 25일 지급'
        },
        {
            year: 2025,
            month: 6,
            day: 5,
            type: '다음 달 신청일',
            title: '한부모가족지원 신청',
            description: '한부모가족지원금 신청',
            status: '신청',
            amount: '월 500,000원',
            documents: ['가족관계증명서', '소득증빙서류'],
            notes: '18세 미만 자녀가 있는 한부모 대상'
        },
        {
            year: 2025,
            month: 7,
            day: 12,
            type: '다음 달 심사일',
            title: '한부모가족지원 심사',
            description: '한부모가족지원 자격 심사',
            status: '심사중',
            amount: '월 500,000원',
            documents: ['소득조사서'],
            notes: '소득 기준 확인 중'
        },
        {
            year: 2025,
            month: 7,
            day: 18,
            type: '다음 달 승인일',
            title: '한부모가족지원 승인',
            description: '한부모가족지원 자격 승인',
            status: '승인',
            amount: '월 500,000원',
            documents: ['승인통지서'],
            notes: '2025년 3월부터 지급'
        },
        {
            year: 2025,
            month: 7,
            day: 25,
            type: '다음 달 지급일',
            title: '한부모가족지원 지급',
            description: '한부모가족지원금 지급',
            status: '완료',
            amount: '월 500,000원',
            documents: ['지급내역서'],
            notes: '매월 25일 지급'
        },
    ];
};*/

const renderCalender = () => {
    const viewYear = date.getFullYear();
    const viewMonth = date.getMonth();

    document.querySelector('#alarm-section .year-month').textContent = `${viewYear}년 ${viewMonth + 1}월`;

    const prevLast = new Date(viewYear, viewMonth, 0);
    const thisLast = new Date(viewYear, viewMonth + 1, 0);

    const PLDate = prevLast.getDate();
    const PLDay = prevLast.getDay();

    const TLDate = thisLast.getDate();
    const TLDay = thisLast.getDay();

    const prevDates = [];
    const thisDates = [...Array(TLDate + 1).keys()].slice(1);
    const nextDates = [];

    if (PLDate !== 6) {
        for (let i = 0; i < PLDay + 1; i++) {
            prevDates.unshift(PLDate - i);
        }
    }

    for (let i = 1; i < 7 - TLDay; i++) {
        nextDates.push(i);
    }

    const dates = prevDates.concat(thisDates, nextDates);
    const firstDateIndex = dates.indexOf(1);
    const lastDateIndex = dates.lastIndexOf(TLDate);

    dates.forEach((d, i) => {
        const condition = i >= firstDateIndex && i < lastDateIndex + 1 ? 'this' : 'other';

        // 여기에 조건부 마크 표시 로직 추가
        const isMarked = condition === 'this' && markedDates.some(md =>
            md.year === viewYear &&
            md.month === viewMonth + 1 &&
            md.day === d
        );
        const markedClass = isMarked ? ' marked' : '';

        dates[i] = `<div class="date">
                        <button class="date-button">
                        <span class="${condition}${markedClass}">${d}</span>
                        </button>
                    </div>`;
    });

    document.querySelector('#alarm-section .dates').innerHTML = dates.join('');

    // 이벤트 리스너 추가
    const dateButtons = document.querySelectorAll('#alarm-section .dates > .date > .date-button');
    dateButtons.forEach(($item, index) => {
        $item.addEventListener('click', () => {
            const dateText = $item.querySelector('span').textContent;
            const clickedDate = parseInt(dateText);

            const hasMarked = markedDates.some(md => md.year === viewYear && md.month === viewMonth + 1 && md.day === clickedDate);

            // 전역 등록하기 버튼 표시 및 이벤트 설정
            const globalAddMarkBtn = document.getElementById('globalAddMarkBtn');
            globalAddMarkBtn.style.display = 'block';
            globalAddMarkBtn.onclick = () => showNotificationRegistration(viewYear, viewMonth + 1, clickedDate);

            if (hasMarked) {
                selectedDate = {year: viewYear, month: viewMonth + 1, day: clickedDate};
                showMarkedListForDate(selectedDate);

                // 해당 날짜의 첫 번째 마크된 항목을 우측 패널에 표시
                const firstMarkedItem = markedDates.find(md => md.year === viewYear && md.month === viewMonth + 1 && md.day === clickedDate);
                if (firstMarkedItem) {
                    showDateDetail(firstMarkedItem);
                }
            } else {
                // 마크되지 않은 날짜 클릭 시 우측 패널 초기화
                const detailBody = document.getElementById('detailBody');
                detailBody.innerHTML = `
                    <div class="no-selection">
                        <p>해당 날짜에 마크된 데이터가 없습니다.</p>
                    </div>
                `;
            }
        });
    });

    // 오늘 날짜에 today 클래스 추가
    const today = new Date();
    if (viewMonth === today.getMonth() && viewYear === today.getFullYear()) {
        const todayElements = document.querySelectorAll('#alarm-section .date .this');
        todayElements.forEach(el => {
            if (+el.innerText === today.getDate()) {
                el.classList.add('today');
            }
        });
    }
};

// 마크 목록 초기화: 항상 표시
const initializeMarkedList = () => {
    updateMarkedList();
};

const showMarkedListForDate = (targetDate) => {
    const container = document.getElementById('markedListContainer');
    const markedList = document.getElementById('markedList');
    const backBtn = container.querySelector('.back-btn');

    const filtered = markedDates.filter(d => d.year === targetDate.year && d.month === targetDate.month && d.day === targetDate.day);

    if (filtered.length === 0) {
        markedList.innerHTML = '<div class="marked-date-item"><span class="marked-date-text">해당 날짜에 마크된 데이터가 없습니다.</span></div>';
        return;
    }

    container.querySelector('.marked-list-header h3').textContent = `${targetDate.year}년 ${targetDate.month}월 ${targetDate.day}일 마크 목록`;

    // 뒤로가기 버튼 표시
    backBtn.style.display = 'flex';

    // 두 줄로 표시: 첫째 줄은 서비스명, 둘째 줄은 부처명
    markedList.innerHTML = filtered.map((d, index) => `
    <div class="marked-date-item" data-index="${index}">
        <div class="marked-date-dot"></div>
        <div class="marked-date-content">
            <div class="marked-date-title">${d.title}</div>
            <div class="marked-date-subtitle">${d.type}</div>
        </div>
    </div>
`).join('');

    // 이벤트 리스너 추가
    const items = container.querySelectorAll('.marked-date-item');
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            showDateDetail(filtered[index]);
        });
    });
};

/*// 특정 날짜의 마크된 데이터만 표시
const showMarkedListForDate = (targetDate) => {
    const container = document.getElementById('markedListContainer');
    const markedList = document.getElementById('markedList');
    const backBtn = container.querySelector('.back-btn');

    const filtered = markedDates.filter(d => d.year === targetDate.year && d.month === targetDate.month && d.day === targetDate.day);

    if (filtered.length === 0) {
        markedList.innerHTML = '<div class="marked-date-item"><span class="marked-date-text">해당 날짜에 마크된 데이터가 없습니다.</span></div>';
        return;
    }

    container.querySelector('.marked-list-header h3').textContent = `${targetDate.year}년 ${targetDate.month}월 ${targetDate.day}일 마크 목록`;

    // 뒤로가기 버튼 표시
    backBtn.style.display = 'flex';

    markedList.innerHTML = filtered.map((d, index) => `
    <div class="marked-date-item" data-index="${index}">
      <div class="marked-date-dot"></div>
      <span class="marked-date-text">${d.title}</span>
      <span class="marked-date-type">${d.type}</span>
    </div>
  `).join('');

    // 이벤트 리스너 추가
    const items = container.querySelectorAll('.marked-date-item');
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            showDateDetail(filtered[index]);
        });
    });
};*/

// 전체 목록 표시 (날짜 묶음)
const updateMarkedList = () => {
    const markedList = document.getElementById('markedList');
    const header = document.querySelector('#alarm-section .marked-list-header h3');
    const backBtn = document.querySelector('#alarm-section .marked-list-header .back-btn');

    header.textContent = '마크된 날짜 목록';

    // 뒤로가기 버튼 숨기기
    backBtn.style.display = 'none';

    if (markedDates.length === 0) {
        markedList.innerHTML = '<div class="marked-date-item"><span class="marked-date-text">마크된 날짜가 없습니다.</span></div>';
        return;
    }

    const unique = [...new Set(markedDates.map(d => `${d.year}-${d.month}-${d.day}`))].sort((a, b) => {
        const [yearA, monthA, dayA] = a.split('-').map(Number);
        const [yearB, monthB, dayB] = b.split('-').map(Number);

        if (yearA !== yearB) return yearB - yearA;  // yearA - yearB → yearB - yearA
        if (monthA !== monthB) return monthB - monthA;  // monthA - monthB → monthB - monthA
        return dayB - dayA;  // dayA - dayB → dayB - dayA
    });

    markedList.innerHTML = unique.map((str, index) => {
        const [year, month, day] = str.split('-').map(Number);
        const items = markedDates.filter(d => d.year === year && d.month === month && d.day === day);
        return `
            <div class="marked-date-item" data-index="${index}">
                <div class="marked-date-dot"></div>
                <span class="marked-date-text">${year}년 ${month}월 ${day}일</span>
                <span class="marked-date-type">${items.length}개 항목</span>
            </div>
        `;
    }).join('');

    // 이벤트 리스너 추가
    const items = markedList.querySelectorAll('.marked-date-item');
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            const str = unique[index];
            const [year, month, day] = str.split('-').map(Number);
            showMarkedListForDate({year: year, month: month, day: day});
        });
    });
};
/*const updateMarkedList = () => {
    const markedList = document.getElementById('markedList');
    const header = document.querySelector('#alarm-section .marked-list-header h3');
    const backBtn = document.querySelector('#alarm-section .marked-list-header .back-btn');

    header.textContent = '마크된 날짜 목록';

    // 뒤로가기 버튼 숨기기
    backBtn.style.display = 'none';

    if (markedDates.length === 0) {
        markedList.innerHTML = '<div class="marked-date-item"><span class="marked-date-text">마크된 날짜가 없습니다.</span></div>';
        return;
    }

    const unique = [...new Set(markedDates.map(d => `${d.year}-${d.month}-${d.day}`))].sort();

    markedList.innerHTML = unique.map((str, index) => {
        const [year, month, day] = str.split('-').map(Number);
        const items = markedDates.filter(d => d.year === year && d.month === month && d.day === day);
        return `
      <div class="marked-date-item" data-index="${index}">
        <div class="marked-date-dot"></div>
        <span class="marked-date-text">${year}년 ${month}월 ${day}일</span>
        <span class="marked-date-type">${items.length}개 항목</span>
      </div>
    `;
    }).join('');

    // 이벤트 리스너 추가
    const items = markedList.querySelectorAll('.marked-date-item');
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            const str = unique[index];
            const [year, month, day] = str.split('-').map(Number);
            showMarkedListForDate({year: year, month: month, day: day});
        });
    });
};*/

// 상세 정보 표시 (우측 패널)
const showDateDetail = (data) => {
    const detailBody = document.getElementById('detailBody');

    detailBody.innerHTML = `
        <div class="detail-info-item">
            <div class="detail-info-label">서비스명</div>
            <div class="detail-info-value">${data.title || '정보 없음'}</div>
        </div>
        <div class="detail-info-item">
            <div class="detail-info-label">소관 부처명</div>
            <div class="detail-info-value">${data.type || '정보 없음'}</div>
        </div>
        <div class="detail-info-item">
            <div class="detail-info-label">서비스요약</div>
            <div class="detail-info-value">${data.summary || '정보 없음'}</div>
        </div>
        <div class="detail-info-item">
            <div class="detail-info-label">지원주기</div>
            <div class="detail-info-value">${data.supportCycle || '정보 없음'}</div>
        </div>
        <div class="detail-info-item">
            <div class="detail-info-label">생애 주기</div>
            <div class="detail-info-value">${data.lifeArray || '정보 없음'}</div>
        </div>
        <a class="detail-link" href="/welfare/detail?id=${data.welfareId}">
            <span class="detail-link-text">복지 서비스 상세보기 →</span>
        </a>
    `;
};


// 달력 네비게이션 함수들
const prevMonth = () => {
    date.setMonth(date.getMonth() - 1);
    renderCalender();

    // 다른 달로 이동한 후 today 클래스 확인 및 적용
    const today = new Date();
    if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        const todayElements = document.querySelectorAll('#alarm-section .date .this');
        todayElements.forEach(el => {
            if (+el.innerText === today.getDate()) {
                el.classList.add('today');
            }
        });
    }
};

const nextMonth = () => {
    date.setMonth(date.getMonth() + 1);
    renderCalender();

    // 다른 달로 이동한 후 today 클래스 확인 및 적용
    const today = new Date();
    if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        const todayElements = document.querySelectorAll('#alarm-section .date .this');
        todayElements.forEach(el => {
            if (+el.innerText === today.getDate()) {
                el.classList.add('today');
            }
        });
    }
};

const goToday = () => {
    date = new Date();
    renderCalender();

    // 오늘 날짜로 이동한 후 today 클래스 강제 적용
    const today = new Date();
    const todayElements = document.querySelectorAll('#alarm-section .date .this');
    todayElements.forEach(el => {
        if (+el.innerText === today.getDate()) {
            el.classList.add('today');
        }
    });
};

// 새로운 마크 등록 함수
const addNewMark = (year, month, day) => {
    const detailBody = document.getElementById('detailBody');

    detailBody.innerHTML = `
        <div class="add-mark-form">
            <h4>새로운 마크 등록</h4>
            <p class="selected-date">${year}년 ${month}월 ${day}일</p>
            
            <div class="form-group">
                <label for="favoriteService">즐겨찾기 서비스 선택</label>
                <select id="favoriteService" onchange="updateFormFromFavorite()">
                    <option value="">서비스를 선택하세요</option>
                    ${favoriteOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label for="markTitle">제목</label>
                <input type="text" id="markTitle" placeholder="마크 제목을 입력하세요">
            </div>
            
            <div class="form-group">
                <label for="markType">유형</label>
                <select id="markType">
                    <option value="신청일">신청일</option>
                    <option value="심사일">심사일</option>
                    <option value="승인일">승인일</option>
                    <option value="지급일">지급일</option>
                    <option value="기타">기타</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="markDescription">설명</label>
                <textarea id="markDescription" placeholder="마크에 대한 설명을 입력하세요"></textarea>
            </div>
            
            <div class="form-group">
                <label for="markStatus">상태</label>
                <select id="markStatus">
                    <option value="신청">신청</option>
                    <option value="진행중">진행중</option>
                    <option value="심사중">심사중</option>
                    <option value="승인">승인</option>
                    <option value="완료">완료</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="markAmount">지급 금액</label>
                <input type="text" id="markAmount" placeholder="예: 월 500,000원">
            </div>
            
            <div class="form-actions">
                <button class="save-mark-btn" onclick="saveNewMark(${year}, ${month}, ${day})">저장</button>
                <button class="cancel-mark-btn" onclick="cancelAddMark()">취소</button>
            </div>
        </div>
    `;
};

const loadFavoritedList = () => {

}

// 알림 등록하기 레이아웃 표시 함수
const showNotificationRegistration = (year, month, day) => {
    const detailBody = document.getElementById('detailBody');

    // 즐겨찾기한 복지 서비스 목록 생성
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert(`[${xhr.status}] 즐겨찾기를 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.`);
            return;
        }
        const welfareFavoriteList = JSON.parse(xhr.responseText);
        let favoritedList = ``;
        for (const welfareFavorite of welfareFavoriteList) {
            favoritedList += `
            <div class="favorited-service-item" data-service-id="${welfareFavorite['welfareId']}">
                <input type="radio" name="selectedService" id="service-${welfareFavorite['welfareId']}" class="service-radio"  onchange="selectService('${welfareFavorite['welfareId']}')">
                <label for="service-${welfareFavorite['welfareId']}" class="service-label">
                    <div class="service-name">${welfareFavorite['welfareName']}</div>
                    <div class="service-category">${welfareFavorite['ministryName']}</div>
                </label>
            </div>`;
        }

        detailBody.innerHTML = `
               <div class="notification-registration">
                   <h4>알림 등록하기</h4>
                   <p class="selected-date">${year}년 ${month}월 ${day}일</p>
                   <div class="favorited-list-section">
                       <h5>즐겨찾기한 리스트</h5>
                       <div class="favorited-services-list">
                           ${favoritedList}
                       </div>
                   </div> 
                   <div class="save-section" style="display: none;">
                       <button class="save-notification-btn" onclick="saveNotification(${year}, ${month}, ${day})">저장</button>
                   </div>
               </div>
           `;
    };
    xhr.open('GET', `/welfare/list`);
    xhr.send();
};
/*const showNotificationRegistration = (year, month, day) => {
    const detailBody = document.getElementById('detailBody');

    // 즐겨찾기한 복지 서비스 목록 생성
    const favoritedList = favoritedWelfareServices.map((service, index) => `
         <div class="favorited-service-item" data-service-id="${service.id}">
             <input type="radio" name="selectedService" id="service-${service.id}" class="service-radio" onchange="selectService(${service.id}, '${service.name}', '${service.category}', '${service.amount}', '${service.status}')">
             <label for="service-${service.id}" class="service-label">
                 <div class="service-name">${service.name}</div>
                 <div class="service-category">${service.category}</div>
             </label>
         </div>
     `).join('');

    detailBody.innerHTML = `
               <div class="notification-registration">
                   <h4>알림 등록하기</h4>
                   <p class="selected-date">${year}년 ${month}월 ${day}일</p>

                   <div class="favorited-list-section">
                       <h5>즐겨찾기한 리스트</h5>
                       <div class="favorited-services-list">
                           ${favoritedList}
                       </div>
                   </div>



                   <div class="save-section" style="display: none;">
                       <button class="save-notification-btn" onclick="saveNotification(${year}, ${month}, ${day})">저장</button>
                   </div>
               </div>
           `;
};*/

// 서비스 선택 함수
const selectService = (serviceId) => {
    // 모든 서비스 항목에서 선택 상태 제거
    const allItems = document.querySelectorAll('.favorited-service-item');
    allItems.forEach(item => {
        item.classList.remove('selected');
    });

    // 선택된 항목에 선택 상태 추가
    const selectedRadio = document.querySelector(`#service-${serviceId}`);
    if (selectedRadio && selectedRadio.checked) {
        const serviceItem = selectedRadio.closest('.favorited-service-item');
        if (serviceItem) {
            serviceItem.classList.add('selected');
        }
    }

    // 선택된 항목이 있으면 저장 버튼 표시
    const saveSection = document.querySelector('.save-section');
    if (selectedRadio && selectedRadio.checked) {
        saveSection.style.display = 'block';
    } else {
        saveSection.style.display = 'none';
    }
};
/*const selectService = (serviceId, name, category, amount, status) => {
    // 모든 서비스 항목에서 선택 상태 제거
    const allItems = document.querySelectorAll('.favorited-service-item');
    allItems.forEach(item => {
        item.classList.remove('selected');
    });

    // 선택된 항목에 선택 상태 추가
    const selectedRadio = document.querySelector(`#service-${serviceId}`);
    if (selectedRadio && selectedRadio.checked) {
        const serviceItem = selectedRadio.closest('.favorited-service-item');
        if (serviceItem) {
            serviceItem.classList.add('selected');
        }
    }

    // 선택된 항목이 있으면 저장 버튼 표시
    const saveSection = document.querySelector('.save-section');
    if (selectedRadio && selectedRadio.checked) {
        saveSection.style.display = 'block';
    } else {
        saveSection.style.display = 'none';
    }
};*/


// 알림 저장 함수
const saveNotification = (year, month, day) => {
    const selectedRadio = document.querySelector('.service-radio:checked');
    if (!selectedRadio) {
        alert('저장할 서비스를 선택해주세요.');
        return;
    }

    // 선택된 서비스 ID 추출
    const serviceId = selectedRadio.id.replace('service-', '');

    // FormData를 사용한 PATCH 요청으로 서버에 알림 데이터 전송
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('welfareId', serviceId);
    formData.append('alarmAt', `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert(`[${xhr.status}] 알림 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.`);
            return;
        }

        const response = JSON.parse(xhr.responseText);

        if (response.result) {
            // 서버 저장 성공 시 markedDates 배열에 직접 추가하지 않음

            // 서버에서 최신 데이터를 다시 가져와서 markedDates 업데이트
            initializeMarkedDates();

            // 성공 메시지 표시
            alert('선택된 서비스의 알림이 성공적으로 등록되었습니다!');

            // 우측 패널을 선택된 날짜의 마크 목록으로 변경
            showMarkedListForDate({year: year, month: month, day: day});

            // 전역 등록하기 버튼 다시 표시
            const globalAddMarkBtn = document.getElementById('globalAddMarkBtn');
            globalAddMarkBtn.style.display = 'block';

            // 라디오 버튼 초기화
            selectedRadio.checked = false;

            // 선택 상태 제거
            const allItems = document.querySelectorAll('.favorited-service-item');
            allItems.forEach(item => {
                item.classList.remove('selected');
            });

            // 저장 버튼 숨기기
            const saveSection = document.querySelector('.save-section');
            saveSection.style.display = 'none';
        } else {
            // 서버 저장 실패 시
            alert('알림 등록에 실패했습니다: ' + (response.message || '알 수 없는 오류'));
        }
    };

    xhr.open('PATCH', `/welfare/alarm`);
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
};
/*// 알림 저장 함수
const saveNotification = (year, month, day) => {
    const selectedRadio = document.querySelector('.service-radio:checked');
    if (!selectedRadio) {
        alert('저장할 서비스를 선택해주세요.');
        return;
    }

    // 선택된 서비스에 대해 알림 등록
    const serviceId = selectedRadio.id.replace('service-', '');
    const selectedService = favoritedWelfareServices.find(service => service.id == serviceId);

    if (selectedService) {
        // 새로운 마크 데이터 생성
        const newMark = {
            year: year,
            month: month,
            day: day,
            type: '복지 서비스 알림',
            title: `${selectedService.name} 알림`,
            description: `${selectedService.name} 서비스에 대한 알림 등록`,
            status: '등록완료',
            amount: selectedService.amount,
            documents: ['알림 등록서'],
            notes: `${selectedService.category} 카테고리의 ${selectedService.name} 서비스 알림`
        };

        // markedDates 배열에 추가
        markedDates.push(newMark);

        // 달력 다시 렌더링하여 마크 표시
        renderCalender();

        // 성공 메시지 표시
        alert('선택된 서비스의 알림이 성공적으로 등록되었습니다!');

        // 우측 패널을 선택된 날짜의 마크 목록으로 변경
        showMarkedListForDate({year: year, month: month, day: day});

        // 전역 등록하기 버튼 다시 표시
        const globalAddMarkBtn = document.getElementById('globalAddMarkBtn');
        globalAddMarkBtn.style.display = 'block';

        // 라디오 버튼 초기화
        selectedRadio.checked = false;

        // 선택 상태 제거
        const allItems = document.querySelectorAll('.favorited-service-item');
        allItems.forEach(item => {
            item.classList.remove('selected');
        });

        // 저장 버튼 숨기기
        const saveSection = document.querySelector('.save-section');
        saveSection.style.display = 'none';
    }
};*/

// 전체 마크된 리스트 보기 함수
const showAllMarkedList = () => {
    const markedList = document.getElementById('markedList');
    const header = document.querySelector('#alarm-section .marked-list-header h3');

    if (markedDates.length === 0) {
        header.textContent = '마크된 날짜 목록';
        markedList.innerHTML = '<div class="marked-date-item"><span class="marked-date-text">마크된 날짜가 없습니다.</span></div>';
        return;
    }

    // 중복 제거: 각 날짜당 한 번만 표시
    const uniqueDates = [];
    const seen = new Set();

    markedDates.forEach(md => {
        const dateKey = `${md.year}-${md.month}-${md.day}`;
        if (!seen.has(dateKey)) {
            seen.add(dateKey);
            uniqueDates.push(md);
        }
    });

    // 중복 제거된 날짜들을 날짜순으로 정렬
    const sortedDates = uniqueDates.sort((a, b) => {
        const dateA = new Date(a.year, a.month - 1, a.day);
        const dateB = new Date(b.year, b.month - 1, b.day);
        return dateB - dateA;  // 내림차순 정렬 (최신 날짜 우선)
    });

    header.textContent = '전체 마크된 날짜 목록';

    markedList.innerHTML = sortedDates.map((date, index) => {
        const items = markedDates.filter(md =>
            md.year === date.year && md.month === date.month && md.day === date.day
        );

        return `
            <div class="marked-date-item" data-index="${index}">
                <div class="marked-date-dot"></div>
                <span class="marked-date-text">${date.year}년 ${date.month}월 ${date.day}일</span>
                <span class="marked-date-type">${items.length}개 항목</span>
            </div>
        `;
    }).join('');

    // 이벤트 리스너 추가
    const items = markedList.querySelectorAll('.marked-date-item');
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            const targetDate = sortedDates[index];
            showMarkedListForDate(targetDate);
        });
    });
};

// 뒤로가기 기능: 전체 마크된 날짜 목록으로 돌아가기
const goBackToCalendar = () => {
    // 헤더 제목을 원래대로 복원
    const header = document.querySelector('#alarm-section .marked-list-header h3');
    header.textContent = '마크된 날짜 목록';

    // 전체 마크된 날짜 목록 표시
    updateMarkedList();

    // 우측 패널 초기화
    const detailBody = document.getElementById('detailBody');
    detailBody.innerHTML = `
        <div class="no-selection">
            <p>달력에서 날짜를 선택하면 상세 정보가 표시됩니다.</p>
        </div>
    `;

    // 선택된 날짜 초기화
    selectedDate = null;

    // 전역 등록하기 버튼 숨기기
    const globalAddMarkBtn = document.getElementById('globalAddMarkBtn');
    globalAddMarkBtn.style.display = 'none';
};

// 초기화
initializeMarkedDates();
renderCalender();
initializeMarkedList();

// 초기 로드 시 뒤로가기 버튼 숨기기
const backBtn = document.querySelector('#alarm-section .marked-list-header .back-btn');
if (backBtn) {
    backBtn.style.display = 'none';
}

// 초기 로드 시 today 클래스 강제 적용
setTimeout(() => {
    const today = new Date();
    if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        const todayElements = document.querySelectorAll('#alarm-section .date .this');
        todayElements.forEach(el => {
            if (+el.innerText === today.getDate()) {
                el.classList.add('today');
            }
        });
    }
}, 100);

const favoriteDelete = (welfareId) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('welfareId', welfareId);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
            console.log("에러");
            return;
        }
        const response = JSON.parse(xhr.responseText);
        if (response.result === true) {
            console.log(response.result.toString());
            location.href = `${origin}/user/info`
        } else {
            console.log(response.result.toString());
        }
    };
    xhr.open('DELETE', '/welfare/like');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
}

const favoriteSectionList = () => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            alert(`[${xhr.status}] 알림 목록을 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.`);
            return;
        }

        const response = JSON.parse(xhr.responseText);
        let $listHTML = ``;
        for (const item of response) {
            $listHTML += `
                        <li class="favorite-item">
                            <a href="/welfare/detail?id=${item['welfareId']}" class="favorite-link">
                                <div class="favorite-content">
                                    <span class="favorite-title">${item['welfareName']}</span>
                                    <span class="favorite-summary">${item['summary']}</span>
                                </div>
                            </a>
                            <span role="none" data-aeo-stretch></span>
                            <div class="favorite-action">
                                    <button class="favorite-remove-btn" type="button" data-id=${item['welfareId']}>
                                        <img src="/welfare/assets/images/welfare-like-liked.png" alt="" class="icon">
                                    </button>
                            </div>
                        </li>
                    `;
        }
        $list.innerHTML += $listHTML;

        $list.querySelectorAll(':scope > .favorite-item > .favorite-action > .favorite-remove-btn').forEach($item => {
            $item.addEventListener('click', () => {
                alert($item.getAttribute('data-id'));
                favoriteDelete($item.getAttribute('data-id'));
            });
        });
    };
    xhr.open('GET', `/welfare/list`);
    xhr.send();
};

favoriteSectionList();