const $pages = document.querySelectorAll('main.pages > .common');
let currentIndex = 1;
$pages.forEach((page, index) => {
    page.classList.remove('visible');
    page.style.display = 'none'
});
$pages[0].classList.add('visible');
$pages[0].style.display = 'flex';

const invalidIndex = setInterval(()=>{
    if (currentIndex >= $pages.length) {
        location.href="/home";
        clearInterval(invalidIndex);
        return;
    }
    $pages.forEach((page)=>{
        page.classList.remove('visible');
        page.style.display = 'none';
    });
    const page = $pages[currentIndex];
    page.style.display = 'flex';
    setTimeout(() => {
        page.classList.add('visible')
    }, 2);
    currentIndex++;
},2000)

