(function ($) {
    "use strict";
    // theme settings
    jQuery.fn.vApp = function (arrr) {
        if (arrr.layout) {
            $(this).addClass(arrr.layout);

        }
        if (arrr.skin) {
            $(this).addClass(arrr.skin);

        }
        if (arrr.pattern) {
            $(this).addClass(arrr.pattern);

        }
    }

})(jQuery);