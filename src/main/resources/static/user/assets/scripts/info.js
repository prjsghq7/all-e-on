const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

const $favoriteSection = document.getElementById('favorite-section');
const $list = $favoriteSection.querySelector(`:scope > .favorite-container > .favorite-list`);

let date = new Date();
let markedDates = []; // 마크된 날짜들을 저장할 배열
let selectedDate = null; // 현재 선택된 날짜

// Controller나 DB에서 받아올 데이터를 시뮬레이션하는 임의의 날짜들 (한 날짜에 여러 건 포함)
const initializeMarkedDates = () => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('오류', '알림 목록을 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.');
            return;
        }

        const response = JSON.parse(xhr.responseText);

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

        // 데이터 로딩 완료 후 UI 업데이트
        renderCalender();
        updateMarkedList();
    };

    xhr.open('GET', `/welfare/alarmList`);
    xhr.setRequestHeader(header, token);
    xhr.send();
};

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
            // 이전에 선택된 버튼의 선택 상태 제거
            const prevSelected = document.querySelector('#alarm-section .date-button.selected');
            if (prevSelected) {
                prevSelected.classList.remove('selected');
            }

            // 현재 클릭된 버튼에 선택 상태 추가
            $item.classList.add('selected');

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

    // 선택된 날짜가 있고 현재 표시된 달력에 해당 날짜가 있다면 선택 상태 복원
    if (selectedDate &&
        selectedDate.year === viewYear &&
        selectedDate.month === viewMonth + 1) {

        const dateButtons = document.querySelectorAll('#alarm-section .dates > .date > .date-button');
        dateButtons.forEach(button => {
            const dateSpan = button.querySelector('span');
            if (dateSpan && dateSpan.textContent == selectedDate.day) {
                // 이전 선택 상태 제거
                const prevSelected = document.querySelector('#alarm-section .date-button.selected');
                if (prevSelected) {
                    prevSelected.classList.remove('selected');
                }

                // 현재 버튼에 선택 상태 추가
                button.classList.add('selected');
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

    // 선택된 날짜가 다른 달로 이동한 경우 선택 상태 초기화
    if (selectedDate &&
        (selectedDate.year !== date.getFullYear() || selectedDate.month !== date.getMonth() + 1)) {
        selectedDate = null;
    }

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

    // 선택된 날짜가 다른 달로 이동한 경우 선택 상태 초기화
    if (selectedDate &&
        (selectedDate.year !== date.getFullYear() || selectedDate.month !== date.getMonth() + 1)) {
        selectedDate = null;
    }

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

    // 선택된 날짜가 다른 달로 이동한 경우 선택 상태 초기화
    if (selectedDate &&
        (selectedDate.year !== date.getFullYear() || selectedDate.month !== date.getMonth() + 1)) {
        selectedDate = null;
    }

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
            dialog.showSimpleOk('오류', '겨찾기를 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.');
            return;
        }
        const welfareFavoriteList = JSON.parse(xhr.responseText);
        let favoritedList = ``;

        // 즐겨찾기 리스트가 비어있는 경우 처리
        if (!welfareFavoriteList || welfareFavoriteList.length === 0) {
            favoritedList = `
            <div class="favorited-service-item empty">
                <div class="service-label">
                    <div class="service-name">저장된 즐겨찾기가 없습니다.</div>
                    <div class="service-category">복지 서비스를 즐겨찾기에 추가해보세요.</div>
                </div>
            </div>`;
        } else {
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

// 알림 저장 함수
const saveNotification = (year, month, day) => {
    const selectedRadio = document.querySelector('.service-radio:checked');
    if (!selectedRadio) {
        dialog.showSimpleOk('오류', '저장할 서비스를 선택해주세요.');
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
            dialog.showSimpleOk('오류', '알림 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            return;
        }

        const response = JSON.parse(xhr.responseText);

        if (response.result) {
            // 서버 저장 성공 시 markedDates 배열에 직접 추가하지 않음

            // 서버에서 최신 데이터를 다시 가져와서 markedDates 업데이트
            initializeMarkedDates();

            // 성공 메시지 표시
            dialog.showSimpleOk('알림', '선택된 서비스의 알림이 성공적으로 등록되었습니다!');

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
            dialog.showSimpleOk('에러', '알림 등록에 실패했습니다.');
        }
    };

    xhr.open('PATCH', `/welfare/alarm`);
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
};

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

// 탭 변경 이벤트 리스너 추가 - 선택된 날짜 상태 유지
const tabInputs = document.querySelectorAll('input[name="tab"]');
tabInputs.forEach(input => {
    input.addEventListener('change', () => {
        // 알림설정 탭(2번)으로 이동할 때 선택된 날짜 상태 복원
        if (input.value === '2' && selectedDate) {
            // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행
            setTimeout(() => {
                restoreSelectedDate();
            }, 100);
        }
    });
});

// 선택된 날짜 상태 복원 함수
const restoreSelectedDate = () => {
    if (!selectedDate) return;

    // 현재 표시된 달력에서 선택된 날짜 버튼 찾기
    const dateButtons = document.querySelectorAll('#alarm-section .dates > .date > .date-button');
    dateButtons.forEach(button => {
        const dateSpan = button.querySelector('span');
        if (dateSpan) {
            const dateText = dateSpan.textContent;
            const clickedDate = parseInt(dateText);

            // 선택된 날짜와 일치하는 버튼 찾기
            if (clickedDate === selectedDate.day &&
                date.getMonth() === selectedDate.month - 1 &&
                date.getFullYear() === selectedDate.year) {

                // 이전 선택 상태 제거
                const prevSelected = document.querySelector('#alarm-section .date-button.selected');
                if (prevSelected) {
                    prevSelected.classList.remove('selected');
                }

                // 현재 버튼에 선택 상태 추가
                button.classList.add('selected');

                // 전역 등록하기 버튼 표시 및 이벤트 설정
                const globalAddMarkBtn = document.getElementById('globalAddMarkBtn');
                if (globalAddMarkBtn) {
                    globalAddMarkBtn.style.display = 'block';
                    globalAddMarkBtn.onclick = () => showNotificationRegistration(selectedDate.year, selectedDate.month, selectedDate.day);
                }

                // 우측 패널에 해당 날짜의 마크 목록 표시
                showMarkedListForDate(selectedDate);

                // 해당 날짜의 첫 번째 마크된 항목을 우측 패널에 표시
                const firstMarkedItem = markedDates.find(md =>
                    md.year === selectedDate.year &&
                    md.month === selectedDate.month &&
                    md.day === selectedDate.day
                );
                if (firstMarkedItem) {
                    showDateDetail(firstMarkedItem);
                }
            }
        }
    });
};

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
            dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        if (response.result === true) {
            // 즐겨찾기 목록 갱신
            favoriteSectionList();

            // 달력의 마크 데이터도 함께 갱신
            initializeMarkedDates();

            // 현재 알림 설정 화면이 열려있다면 함께 갱신
            const detailBody = document.getElementById('detailBody');
            if (detailBody && detailBody.querySelector('.notification-registration')) {
                // 현재 선택된 날짜 정보 가져오기
                const selectedDateText = detailBody.querySelector('.selected-date').textContent;
                const dateMatch = selectedDateText.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);

                if (dateMatch) {
                    const year = parseInt(dateMatch[1]);
                    const month = parseInt(dateMatch[2]);
                    const day = parseInt(dateMatch[3]);

                    // 알림 설정 화면 새로고침
                    showNotificationRegistration(year, month, day);
                }
            }
        } else {
            dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('DELETE', '/welfare/like');
    xhr.setRequestHeader(header, token);
    xhr.send(formData);
}

const favoriteSectionList = () => {
    const xhr = new XMLHttpRequest();
    $list.innerHTML = ``;

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            dialog.showSimpleOk('오류', '즐겨찾기 목록을 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.');
            return;
        }

        const response = JSON.parse(xhr.responseText);

        // 즐겨찾기한 서비스가 없는 경우
        if (!response || response.length === 0) {
            $list.innerHTML = `
                <li class="favorite-item empty">
                    <div class="favorite-content">
                        <span class="favorite-title">즐겨찾기된 서비스가 없습니다.</span>
                        <span class="favorite-summary">복지 서비스를 즐겨찾기에 추가해보세요.</span>
                    </div>
                </li>
            `;
            return;
        }

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
        $list.innerHTML = $listHTML; // += 대신 = 사용하여 기존 내용 교체

        // 이벤트 리스너 다시 등록
        $list.querySelectorAll(':scope > .favorite-item > .favorite-action > .favorite-remove-btn').forEach($item => {
            $item.addEventListener('click', () => {
                favoriteDelete($item.getAttribute('data-id'));
            });
        });
    };
    xhr.open('GET', `/welfare/list`);
    xhr.send();
};

favoriteSectionList();