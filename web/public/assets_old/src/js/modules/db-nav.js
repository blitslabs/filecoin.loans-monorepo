/*!
 * DB Nav Responsive Dropdown Navigation Menu
 * (c) 2018 Faridul Haque | Team Dhrubok
 */
;
(function ($, window, document, undefined) {


    $.navigation = function (element, options) {
        $(document).ready(function () {
            checkWidth(true);

            $(window).resize(function () {
                checkWidth(false);
            });
        });

        var hoverShowEvents = "mouseenter focusin";
        var hoverHideEvents = "mouseleave focusout";


        function checkWidth(init) {
            // If browser resized, check width again 
            if ($(window).width() <= 992) {
                $(element).addClass('navigation__portrait');
                $(element).removeClass('navigation__landscape');
                $(".navigation-dropdown").css({
                    "display": "none"
                });
            } else {
                if (!init) {
                    $('html').removeClass('navigation__portrait');
                    $(".navigation-dropdown").css({
                        "display": "block"
                    });
                }
            }
            if ($(window).width() > 992) {
                $(element).addClass('navigation__landscape');
                $(element).removeClass('navigation__portrait');
                $(element).removeClass('offcanvas__overlay');
                $('body').removeClass('scroll-prevent');
                $('.navigation-wrapper').removeClass('offcanvas__is-open');
            } else {
                if (!init) {
                    $(element).removeClass('navigation__landscape');
                }
            }
            // dropdown auto aligned 
            if ($(window).width() <= 1280) {
                $('.navigation-dropdown .navigation-dropdown').addClass('algin-to-left');
            } else {
                $('.navigation-dropdown .navigation-dropdown').removeClass('algin-to-left');
            }

        }

        // Submenu 
        $(element).find('.navigation-menu__link').on(hoverShowEvents, function () {
            $(element).find('.navigation-menu__link').parent().children(".nav-submenu").stop(true, true).delay(0).fadeIn(300);
        }).on(hoverHideEvents, function () {
            $(element).find('.navigation-menu__link').parent().children(".nav-submenu").stop(true, true).delay(0).fadeOut(300);

        });

        // offcanvas reveal 
        // $('.navigation__toggler').on('click', function () {
        //     $('.navigation-wrapper').addClass('offcanvas__is-open');
        //     $('.navigation').addClass('offcanvas__overlay');
        //     $('body').toggleClass('scroll-prevent');
        // });
        // offcanvas remove class 
        // $('body').on('click', function () {
        //     $('.navigation-wrapper').removeClass('offcanvas__is-open')
        //     $(element).removeClass('offcanvas__overlay');
        //     $('body').removeClass('scroll-prevent');
        // });

        // offcanvas prevent from toggle 
        $('.navigation__toggler').on('click', function (e) {
            e.stopPropagation();
        });

        $('body').on('click', '.navigation-wrapper', function (e) {
            e.stopPropagation();
        });

        // offcanvas menu dropdown and caret slide 
        $('body').find('.navigation-menu__link').on('click', '.submenu-icon', function (e) {
            if ($(".navigation__portrait").length > 0) {
                e.stopPropagation();
                if ($(".navigation-dropdown").length > 0) {
                    $(this).parent('a').parent('.navigation-menu__item').children('.navigation-dropdown').slideToggle();
                    $(this).parent('a').toggleClass('highlight');
                    $(this).toggleClass('submenu-icon__caret--up');
                }
            }
        });

        // dropdown submenu icon append 
        $(element).find("li").each(function () {
            if ($(this).children(".navigation-dropdown").length > 0) {
                // $(this).children(".navigation-dropdown").addClass("nav-submenu");
                $(this).children("a").append(
                    "<span class='submenu-icon'>" +
                    "<span class='submenu-icon__caret'></span>" +
                    "</span>"
                );
            }
        });
        $('body').on('click', '.submenu-icon', function (e) {
            e.stopPropagation();
        });
        // sticky nav
        $(window).on("scroll load", function () {
            if ($(window).scrollTop() > 100) {
                $(element).addClass('sticky-nav');
            } else {
                $(element).removeClass('sticky-nav');
            }
        });

    };


    $.fn.navigation = function (options) {
        return this.each(function () {
            if (undefined === $(this).data("navigation")) {
                var plugin = new $.navigation(this, options);
                $(this).data("navigation", plugin);
            }
        });
    };

})(jQuery, window, document);



//smoothscroll and scrollspy

$(document).on("scroll", onScroll);
var currentClass = "current-menu-item";

$('a[href^="#"]').on('click', function (e) {
    e.preventDefault();
    $(document).off("scroll");
    $('a').each(function () {
        $(this).removeClass(currentClass);
    })
    $(this).addClass(currentClass);
    var target = this.hash,
        menu = target;
    $target = $(target);
    $('html, body').stop().animate({
        'scrollTop': $target.offset().top + 2
    }, 500, 'swing', function () {
        window.location.hash = target;
        $(document).on("scroll", onScroll);
    });
});

function onScroll(event) {
    var scrollPos = $(document).scrollTop();
    $('.navigation a').each(function () {
        var currLink = $(this);
        if (currLink.attr("href") != "#") {
            var refElement = $(currLink.attr("href"));
            if (refElement.length) {
                if (refElement.position().top <= scrollPos + 4 && refElement.position().top + refElement.height() > scrollPos + 4) {
                    $('.navigation li a').removeClass(currentClass);
                    currLink.addClass(currentClass);
                } else {
                    currLink.removeClass(currentClass);
                }
            }
        }
    });
}

// nav init
$(document).ready(function () {
    $(".navigation").navigation();
});