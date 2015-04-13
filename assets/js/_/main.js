// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function () {
    $('.navbar-toggle:visible').click();
});

// Lazy load images
$(function () {
    $("img.lazy").lazyload();
});

// Swiftype Search
(function (w, d, t, u, n, s, e) {
    w['SwiftypeObject'] = n;
    w[n] = w[n] || function () {
        (w[n].q = w[n].q || []).push(arguments);
    };
    s = d.createElement(t);
    e = d.getElementsByTagName(t)[0];
    s.async = 1;
    s.src = u;
    e.parentNode.insertBefore(s, e);
})(window, document, 'script', '//s.swiftypecdn.com/install/v1/st.js', '_st');
_st('install', 'UfjNQb2D33csw9E3BFjv');
