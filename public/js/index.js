// Script for scroll
function changebg() {
    var navi = document.getElementById('navi');
    var scrollValue = window.scrollY;

    if (scrollValue < 100) {
        navi.classList.remove('scrolling-active');
    } else {
        navi.classList.add('scrolling-active');
    }
}

window.addEventListener('scroll', changebg);


// Togle script

function tugol() {
    var navi = document.getElementById('navi');
    navi.classList.add('scrolling-active');
}
