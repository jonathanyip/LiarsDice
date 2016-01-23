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
    $.fn.animIndexIntro = function() {
        this.velocity('transition.slideUpIn', { duration: 500, delay: 100 });
        return this;
    }
})(jQuery);

/* General batch animation functions */
var anim = {
    diceIntro: function(dice) {
        dice[0].element.animDiceIntro(0);
        dice[1].element.animDiceIntro(150);
        dice[2].element.animDiceIntro(300, function() {
            $('#index-main').animIndexIntro();
        });
    },
    randomizeDice: function(dice) {
        for(var i = 0; i < dice.length; i++) {
            dice[i].randomize.call(dice[i]);
        }
    }
};
