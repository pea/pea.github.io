var divs = document.querySelectorAll('.code'), i;

for (i = 0; i < divs.length; ++i) {
    divs[i].innerHTML = htmlEscape(divs[i].innerHTML);
}

function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
