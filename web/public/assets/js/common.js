// svg icons support ie11
(function () {
    svg4everybody();
})();

// check if touch device
function isTouchDevice() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function mq(query) {
        return window.matchMedia(query).matches;
    };
    if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}

if (isTouchDevice()) {
    $('body').addClass('touch-device');
}

// tooltip
$(document).ready(function () {
    if (!isTouchDevice()) {
        $('.tooltip').tooltipster({
            theme: ['tooltipster-shadow', 'tooltipster-shadow-customized'],
            delay: 0,
            side: 'bottom',
            arrow: false,
            maxWidth: 300
        });
    }
    if (isTouchDevice()) {
        $('.tooltip').tooltipster({
            theme: ['tooltipster-shadow', 'tooltipster-shadow-customized'],
            delay: 0,
            side: 'bottom',
            arrow: false,
            trigger: 'click',
            maxWidth: 200
        });
    }
});

// field view password
(function () {
    var view = $('.js-field-view');
    view.on('click', function () {
        $(this).toggleClass('active');
    });
})();

// toggle body theme
(function () {
    var switchTheme = $('.js-switch-theme'),
        body = $('body');
    switchTheme.on('change', function () {
        if (!body.hasClass('dark')) {
            body.addClass('dark');
        } else {
            body.removeClass('dark');
        }
    });
})();

// header search
(function () {
    var header = $('.js-header'),
        search = header.find('.js-header-search'),
        open = header.find('.js-header-open'),
        burger = header.find('.js-header-burger'),
        bg = header.find('.js-header-bg'),
        sidebar = $('.js-sidebar'),
        close = sidebar.find('.js-sidebar-close'),
        html = $('html'),
        body = $('body');
    open.on('click', function () {
        search.toggleClass('active');
    });
    burger.on('click', function () {
        sidebar.addClass('visible');
        bg.addClass('show');
        html.addClass('no-scroll');
        body.addClass('no-scroll');
    });
    close.on('click', function () {
        sidebar.removeClass('visible');
        bg.removeClass('show');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
    bg.on('click', function () {
        sidebar.removeClass('visible');
        bg.removeClass('show');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
})();

// page1
(function () {
    var header = $('.js-header1'),
        burger = header.find('.js-header1-burger'),
        bg = header.find('.js-header1-bg'),
        page = $('.js-page1'),
        sidebar = $('.js-sidebar1'),
        close = sidebar.find('.js-sidebar1-close'),
        messages = $('.js-messages'),
        html = $('html'),
        body = $('body'),
        widget = $('.js-widget'),
        widgetBtn = $('.js-widget-btn'),
        widgetClose = $('.js-widget-close'),
        search = $('.js-search'),
        searchArrow = $('.js-search-arrow'),
        searchInput = $('.js-search-input'),
        result = $('.js-search-result'),
        form = $('.js-search-form');
    burger.on('click', function () {
        page.toggleClass('toggle');
        messages.toggleClass('wide');
        bg.toggleClass('visible');
        // html.addClass('no-scroll');
        // body.addClass('no-scroll');
    });
    widgetBtn.on('click', function () {
        widget.toggleClass('visible');
    });
    widgetClose.on('click', function () {
        widget.removeClass('visible');
    });
    searchArrow.on('click', function () {
        result.hide();
        if (!search.hasClass('active')) {
            searchArrow.hide();
            search.removeClass('active');
            bg.removeClass('show');
            form.hide();
            search.addClass('active');
            bg.addClass('show');
            form.show();
        } else {
            if (result.is(':hidden')) {
                searchArrow.hide();
                form.show();
            } else {
                search.removeClass('active');
                form.hide();
                bg.removeClass('show');
            }
        }
    });
    searchInput.keypress(function () {
        searchArrow.show();
        search.addClass('active');
        form.hide();
        result.show();
        bg.addClass('show');
    });

    close.on('click', function () {
        page.removeClass('toggle');
        bg.removeClass('visible');
        // html.removeClass('no-scroll');
        // body.removeClass('no-scroll');
    });
    bg.on('click', function () {
        page.removeClass('toggle');
        searchArrow.show();
        search.removeClass('active');
        form.hide();
        result.hide();
        bg.removeClass('show visible');
    });

    $('.messages__item').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('.page1__container').addClass('show');
    });
    $('.js-message-close').on('click', function () {
        $('.page1__container').removeClass('show');
    });
})();

// field
(function () {
    $('.js-field-input').focusin(function () {
        $(this).parents('.js-field').addClass('active');
    });
    $('.js-field-input').focusout(function () {
        var _this = $(this),
            field = _this.parents('.js-field'),
            value = _this.val();
        if (value == '') {
            field.removeClass('active');
        }
    });
})();

// accord
(function () {
    var items = $('.js-accord-item');
    items.each(function () {
        var item = $(this),
            head = item.find('.js-accord-head'),
            body = item.find('.js-accord-body');

        head.on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            item.toggleClass('active');
            body.slideToggle();
        });
    });
})();

// options
(function () {
    var options = $('.js-options');
    options.each(function () {
        var item = $(this);
        btn = item.find('.js-options-btn'), dropdown = item.find('.js-options-dropdown'), close = item.find('.js-options-close');
        btn.on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!item.hasClass('active')) {
                options.removeClass('active');
                item.addClass('active');
            } else {
                options.removeClass('active');
            }
        });
        close.on('click', function (e) {
            item.removeClass('active');
        });
        dropdown.on('click', function (e) {
            e.stopPropagation();
        });
        $('body').on('click', function () {
            options.removeClass('active');
        });
    });
})();

// options1
(function () {
    var options = $('.js-options1');
    options.each(function () {
        var option = $(this);
        btn = option.find('.js-options1-btn'), dropdown = option.find('.js-options1-dropdown'), items = option.find('.js-options1-item');
        btn.on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!option.hasClass('active')) {
                options.removeClass('active');
                option.addClass('active');
            } else {
                options.removeClass('active');
            }
        });
        items.each(function () {
            var item = $(this);
            head = item.find('.js-options1-head'), body = item.find('.js-options1-body');
            head.on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (!item.hasClass('active')) {
                    items.removeClass('active');
                    item.addClass('active');
                } else {
                    items.removeClass('active');
                }
            });
        });
        dropdown.on('click', function (e) {
            e.stopPropagation();
        });
        $('body').on('click', function () {
            options.removeClass('active');
            items.removeClass('active');
        });
    });
})();

// dropdown
(function () {
    var dropdowns = $('.js-dropdown');
    dropdowns.each(function () {
        var dropdown = $(this);
        head = dropdown.find('.js-dropdown-head'), body = dropdown.find('.js-dropdown-body');
        head.on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!dropdown.hasClass('active')) {
                dropdowns.removeClass('active');
                dropdown.addClass('active');
            } else {
                dropdowns.removeClass('active');
            }
        });
        body.on('click', function (e) {
            e.stopPropagation();
        });
        $('body').on('click', function () {
            dropdowns.removeClass('active');
        });
    });
})();

// projects
(function () {
    var box = $('.js-sorting-box'),
        search = $('.js-sorting-search'),
        open = $('.js-sorting-open'),
        container = $('.js-projects-container');
    box.on('click', function (e) {
        e.preventDefault();
        var _this = $(this),
            _thisClass = _this.data('class');
        box.removeClass('active');
        _this.addClass('active');
        container.removeClass('cell line');
        container.addClass(_thisClass);
    });

    open.on('click', function (e) {
        search.toggleClass('show');
    });
})();

// magnificPopup
(function () {
    var link = $('.js-popup-open');
    link.magnificPopup({
        type: 'inline',
        fixedContentPos: true,
        removalDelay: 200,
        callbacks: {
            beforeOpen: function beforeOpen() {
                this.st.mainClass = this.st.el.attr('data-effect');
            }
        }
    });
})();

// article
(function () {
    var article = $('.js-article'),
        content = article.find('.js-article-content'),
        more = article.find('.js-article-more');
    more.click(function (e) {
        e.preventDefault();
        var _this = $(this),
            el = _this.parents('.js-article').find('.js-article-content');
        if (!el.hasClass('activated')) {
            curHeight = el.height();
            el.addClass('activated');
        };
        var autoHeight = el.css('height', 'auto').height(),
            textHide = _this.data('text-hide'),
            textShow = _this.data('text-show');
        if (_this.hasClass('active')) {
            _this.removeClass('active');
            _this.text(textShow);
            el.animate({ height: curHeight }, 500);
        } else {
            _this.addClass('active');
            _this.text(textHide);
            el.height(curHeight).animate({ height: autoHeight }, 500);
        }
        return false;
    });
})();

// activity
(function () {
    var group = $('.js-activity-group'),
        head = group.find('.js-activity-head'),
        tags = group.find('.js-activity-tags');
    head.on('click', function () {
        group.toggleClass('active');
        tags.slideToggle();
    });
})();

// page2
(function () {
    var header = $('.js-header2'),
        burger = header.find('.js-header2-burger'),
        bg = header.find('.js-header2-bg'),
        users = header.find('.js-header2-users'),
        page = $('.js-page2'),
        sidebar = $('.js-sidebar2'),
        closeSidebar = sidebar.find('.js-sidebar2-close'),
        post = $('.js-post'),
        item = post.find('.js-post-item'),
        write = post.find('.js-post-write'),
        closePost = post.find('.js-post-close'),
        html = $('html'),
        body = $('body');
    burger.on('click', function () {
        sidebar.addClass('visible');
        bg.toggleClass('visible');
        html.addClass('no-scroll');
        body.addClass('no-scroll');
    });
    users.on('click', function () {
        page.toggleClass('toggle');
    });
    write.on('click', function () {
        item.addClass('active');
        bg.addClass('visible');
    });
    closePost.on('click', function () {
        item.removeClass('active');
        bg.removeClass('visible');
    });

    closeSidebar.on('click', function () {
        page.removeClass('toggle');
        sidebar.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
    bg.on('click', function () {
        item.removeClass('active');
        sidebar.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
})();

// videos
(function () {
    var videos = $('.js-videos'),
        search = videos.find('.js-videos-search'),
        open = videos.find('.js-videos-open');
    if (window.matchMedia("(max-width: 767px)").matches) {
        open.on('click', function () {
            search.toggleClass('show');
        });
    }
})();

// page3
(function () {
    var header = $('.js-header3'),
        burger = header.find('.js-header3-burger'),
        bg = header.find('.js-header3-bg'),
        page = $('.js-page3'),
        sidebar = $('.js-sidebar3'),
        sidebarClose = sidebar.find('.js-sidebar3-close'),
        sidebarItem = sidebar.find('.js-sidebar3-item'),
        courses = $('.js-courses1'),
        coursesBack = courses.find('.js-courses1-back'),
        html = $('html'),
        body = $('body');
    burger.on('click', function () {
        sidebar.addClass('visible');
        bg.toggleClass('visible');
        html.addClass('no-scroll');
        body.addClass('no-scroll');
    });
    coursesBack.on('click', function (e) {
        e.preventDefault();
        page.toggleClass('toggle');
    });
    sidebarItem.on('click', function (e) {
        e.preventDefault();
        page.toggleClass('toggle');
    });
    sidebarClose.on('click', function () {
        page.removeClass('toggle');
        sidebar.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
    bg.on('click', function () {
        sidebar.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
})();

// player item
if (window.matchMedia("(max-width: 767px)").matches) {
    (function () {
        var items = $('.js-player-item');
        items.each(function () {
            var item = $(this),
                head = item.find('.js-player-head'),
                body = item.find('.js-player-body');

            head.on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                item.toggleClass('active');
                body.slideToggle();
            });
        });
    })();
}

$('.js-editor-content').richText();

// page4
(function () {
    var header = $('.js-header4'),
        burger = header.find('.js-header4-burger'),
        bg = header.find('.js-header4-bg'),
        page = $('.js-page4'),
        sidebar = $('.js-sidebar4'),
        closeSidebar = sidebar.find('.js-sidebar4-close'),
        code = $('.js-code'),
        wrap = code.find('.js-code-wrap'),
        full = code.find('.js-code-full'),
        closeCode = code.find('.js-code-close'),
        filters = $('.js-filters'),
        back = filters.find('.js-filters-back'),
        open = $('.js-filters-open'),
        html = $('html'),
        body = $('body');
    burger.on('click', function () {
        sidebar.addClass('visible');
        bg.toggleClass('visible');
        html.addClass('no-scroll');
        body.addClass('no-scroll');
    });
    closeSidebar.on('click', function () {
        sidebar.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
    bg.on('click', function () {
        sidebar.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
        filters.removeClass('show');
    });

    full.on('click', function () {
        wrap.addClass('show');
    });
    closeCode.on('click', function () {
        wrap.removeClass('show');
    });

    open.on('click', function () {
        filters.addClass('show');
        bg.addClass('visible');
        html.addClass('no-scroll');
        body.addClass('no-scroll');
    });

    back.on('click', function (e) {
        e.preventDefault();
        filters.removeClass('show');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
})();

$('.code__content table').wrap("<div class='table-wrap'></div>");

// page6
(function () {
    var header = $('.js-header6'),
        burger = header.find('.js-header6-burger'),
        bg = header.find('.js-header6-bg'),
        page = $('.js-page6'),
        pageFilters = page.find('.js-page6-filters'),
        pageBtn = page.find('.js-page6-btn'),
        sidebar = $('.js-sidebar6'),
        closeSidebar = sidebar.find('.js-sidebar6-close'),
        filters = $('.js-filters1'),
        closeFilters = filters.find('.js-filters1-close'),
        open = $('.js-jobs-filters'),
        appl = $('.js-applicant'),
        link = appl.find('.js-applicant-link'),
        box = appl.find('.js-applicant-box'),
        html = $('html'),
        body = $('body');

    burger.on('click', function () {
        sidebar.addClass('visible');
        bg.toggleClass('visible');
        html.addClass('no-scroll');
        body.addClass('no-scroll');
    });
    closeSidebar.on('click', function () {
        sidebar.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
    bg.on('click', function () {
        sidebar.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
        filters.removeClass('show');
    });

    pageBtn.on('click', function () {
        pageFilters.addClass('show');
    });

    link.on('click', function () {
        var thisLink = $(this),
            indexLink = thisLink.index();
        link.removeClass('active');
        thisLink.addClass('active');
        box.hide();
        box.eq(indexLink).fadeIn();
        return false;
    });

    open.on('click', function (e) {
        e.preventDefault();
        filters.addClass('show');
        bg.addClass('visible');
        html.addClass('no-scroll');
        body.addClass('no-scroll');
    });

    closeFilters.on('click', function (e) {
        e.preventDefault();
        filters.removeClass('show');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
})();

// page7
(function () {
    var header = $('.js-header7'),
        burger = header.find('.js-header7-burger'),
        bg = header.find('.js-header7-bg'),
        page = $('.js-page7'),
        open = page.find('.js-page7-open'),
        sidebarPage = page.find('.js-page7-sidebar'),
        burgerPage = page.find('.js-page7-burger'),
        sidebar = $('.js-sidebar7'),
        closeUsers = $('.js-users1-close'),
        closeSidebar = sidebar.find('.js-sidebar7-close'),
        html = $('html'),
        body = $('body');

    burger.on('click', function () {
        sidebar.addClass('visible');
        sidebarPage.addClass('visible');
        bg.toggleClass('visible');
        html.addClass('no-scroll');
        body.addClass('no-scroll');
    });
    closeSidebar.on('click', function () {
        sidebar.removeClass('visible');
        sidebarPage.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
    burgerPage.on('click', function () {
        sidebar.removeClass('visible');
        sidebarPage.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });
    bg.on('click', function () {
        sidebar.removeClass('visible');
        sidebarPage.removeClass('visible');
        bg.removeClass('visible');
        html.removeClass('no-scroll');
        body.removeClass('no-scroll');
    });

    open.on('click', function (e) {
        e.preventDefault();
        page.toggleClass('toggle');
    });
    closeUsers.on('click', function () {
        page.removeClass('toggle');
    });
})();

// map svg
(function () {
    var map = $('.js-map-svg');
    if (map.length) {
        map.vectorMap({
            map: 'world_en',
            backgroundColor: 'transparent',
            borderColor: '#ffffff',
            borderOpacity: 0.25,
            borderWidth: 1,
            color: '#E2E2EA',
            enableZoom: true,
            hoverColor: 'inherit',
            hoverOpacity: .8,
            normalizeFunction: 'linear',
            selectedColor: '#E2E2EA',
            selectedRegions: null,
            showTooltip: true,
            colors: {
                us: '#0062FF',
                ci: '#0062FF',
                gh: '#0062FF',
                lr: '#0062FF',
                sl: '#0062FF',
                gn: '#0062FF',
                gw: '#0062FF',
                co: '#FF974A',
                dz: '#FF974A',
                ml: '#FF974A',
                mr: '#FF974A',
                ma: '#FF974A',
                bf: '#FF974A',
                sn: '#FF974A',
                ir: '#FF974A',
                pk: '#FF974A',
                my: '#FF974A',
                mx: '#FFC542',
                pe: '#FFC542',
                sd: '#FFC542',
                in: '#FFC542',
                cn: '#FFC542',
                id: '#FFC542',
                au: '#FFC542'
            }
        });
    }
})();