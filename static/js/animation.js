/* Animation Jquery Functions */
(function($){
    /* Shows a page */
    $.fn.animShowPage = function(callback) {
        this.velocity('transition.slideUpIn', { duration: 100, complete: callback });
        return this;
    };
    /* Hides a page */
    $.fn.animHidePage = function(callback) {
        this.velocity('transition.slideUpOut', { duration: 100, complete: callback });
        return this;
    };
    /* Shows an error. If it already exists, reshow it. */
    $.fn.animShowError = function(delay, callback) {
        if(this.css('display') === 'none') {
            this.velocity('slideDown', { duration: 200, queue: false })
                .velocity('transition.slideRightIn', { duration: 200 });
        } else {
            this.velocity('transition.slideRightIn', { duration: 200 });
        }

        typeof callback === 'function' && callback();
        return this;
    };

    /* Animate the dice introduction. */
    $.fn.animDiceIntro = function(delay, callback) {
        this.velocity({
            rotateZ: 360,
            height: 50,
            width: 50,
            opacity: 1
        }, {
            delay: delay,
            easing: 'ease-out',
            display: 'inline-block',
            duration: 500,
            complete: callback
        });
        return this;
    }
    $.fn.animIndexIntro = function(callback) {
        this.velocity('transition.slideUpIn', { duration: 500, delay: 100, complete: callback });
        return this;
    }
    $.fn.animShowDots = function() {
        var dots = this.find(".dot");
        for(var i = 0; i < dots.length; i++) {
            $(dots[i]).velocity('transition.expandIn', { duration: 500 });
        }
        return this;
    }

    /* Dice Animation */
    $.fn.moveDot = function(top, left) {
        this.velocity({ top: top, left: left }, { easing: 'ease-in-out', duration: 500, queue: false });
    }
    $.fn.animDiceDots = function(number) {
        var dots = this.find(".dot");
        switch(number) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            $(dots[0]).moveDot(5*number, 5*number);
        }
    }
})(jQuery);
