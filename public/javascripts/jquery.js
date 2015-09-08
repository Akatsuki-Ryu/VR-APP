
(function($) {



    $(function() {

        var	$window = $(window),
            $body = $('body');

        $body.addClass('is-loading');

        $window.on('load', function() {
            $body.removeClass('is-loading');
        });



        $(navPanel)
            .panel({
                delay: 500,
                hideOnClick: true,
                hideOnSwipe: true,
                resetScroll: true,
                resetForms: true,
                side: 'left',
                target: $body,
                visibleClass: 'navPanel-visible'
            });

    });

})(jQuery);