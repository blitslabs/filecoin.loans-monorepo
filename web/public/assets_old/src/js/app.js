// Use following syntax to prepend required libraries/scripts
// Use **/*.js if you don't need to follow a specific order
// You can override the order by requiring the JS file before the global require
//=require vendor/**/jquery.min.js
//=require vendor/**/*.js
//=require modules/**/*.js
(function ($) {
    "use strict";
    
    // video popup
    var html5lightbox_options = {
        watermarklink: ""
    };

    // image settings
    $(".media__content").each(function () {
        var thesrc = $(this).attr('src');
        $(this).parent().css("background-image", "url(" + thesrc + ")");
        $(this).parent().css("background-repeat", "no-repeat");
        $(this).hide();
    });

    // testimonial-1
    $('.testimonial-one .testimonial').slick({
        vertical: true,
        verticalSwiping: true,
        slidesToShow: 2,
        slidesToScroll: 2,
        prevArrow: '<div><button class="prevArrow arrowBtn"><i class="nc-icon nc-tail-left"></i></button></div>',
        nextArrow: '<div><button class="nextArrow arrowBtn"><i class="nc-icon nc-tail-right"></i></button></div>',

        responsive: [{
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                vertical: false,
                verticalSwiping: false,

            }
        }]
    });
    // testimonial-2
    $('.testimonial-two .testimonial').slick({
        autoplay: false,
        prevArrow: '<div><button class="prevArrow arrowBtn"><i class="nc-icon nc-tail-left"></i></button></div>',
        nextArrow: '<div><button class="nextArrow arrowBtn"><i class="nc-icon nc-tail-right"></i></button></div>',
        responsive: [{
            breakpoint: 992,
            settings: {
                arrows: false,

            }
        }]
    });
    // testimonial-3
    $('.testimonial-three .testimonial').slick({
        autoplay: true,
        slidesToShow: 2,
        arrows: false,
        dots: false,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
            }
        }]
    });

    // on reveal
    window.sr = ScrollReveal();
    sr.reveal('.reveal, .faq-list, .feature__list', {
        duration: 1000,
        delay: 0,
        scale: 1,
        opacity: .2,
        easing: 'ease-in-out',
    });

    // pricing 
    $(".prcing-table").ready(function () {
        $(".prcing-table").parent().parent().css("align-items", "center")
    });

    // pricing value change
    $('.tab__annual').click(function () {
        $('.pro .value').text('219');
        $('.company .value').text('449');
    });

    $('.tab__monthly').click(function () {
        $('.pro .value').text('19');
        $('.company .value').text('39');
    });

    // pricing tab
    $(document).on('click', '.pricing-tab-list__item', function () {
        $('.current').removeClass('current');
        $(this).addClass('current');
    });

    // faq sidebar sticky
    $(window).on("scroll", function () {
        var winTop = $(window).scrollTop();

        if (winTop >= 250) {
            $(".faq-sidebar").addClass("faq-sidebar--is-fixed");
        } else {
            $(".faq-sidebar").removeClass("faq-sidebar--is-fixed");
        }
    });

    // faq sidebar active class toggle

    $(".faq-sidebar-list__item a").on('click', function () {
        $('.faq-sidebar-list__item a').removeClass('active');
        $(this).addClass('active');
    });

    // faq smooth scroll
    $('.faq-sidebar a').bind('click', function (event) {
        var $anchor = $(this);
        var headerH = '150';
        $('.header').outerHeight();
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - headerH + "px"
        }, 1200, 'easeInOutExpo');

        event.preventDefault();
    });
    $.extend($.easing, {
        easeInOutExpo: function (t, e, i, n, s) {
            return 0 == e ? i : e == s ? i + n : (e /= s / 2) < 1 ? n / 2 * Math.pow(2, 10 * (e - 1)) + i : n / 2 * (-Math.pow(2, -10 * --e) + 2) + i
        },
    });

})(jQuery);