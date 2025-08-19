const $searchForm = document.getElementById('searchForm');

$searchForm.querySelectorAll('input[name="code"]').forEach($btnRadio => {
    $btnRadio.addEventListener('click', (e) => {
        const searchType = $searchForm['searchType'].value;
        const searchKeyCode = $searchForm['searchKeyCode'].value;
        const keyword = $searchForm['keyword'].value;
        const code = $searchForm['code'].value;
        // alert(`${origin}/welfare/list?searchType=${searchType}&searchKeyCode=${searchKeyCode}&keyword=${keyword}&code=${code}`);
        location.href = `${origin}/welfare/list?searchType=${searchType}&searchKeyCode=${searchKeyCode}&keyword=${keyword}&code=${code}`;
    });
});