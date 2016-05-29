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
	$.fn.animShowError = function(callback) {
		if(this.css('display') === 'none') {
			this.velocity('slideDown', { duration: 200, queue: false })
				.velocity('transition.slideRightIn', { duration: 200 });
		} else {
			this.velocity('transition.slideRightIn', { duration: 200 });
		}

		typeof callback === 'function' && callback();
		return this;
	};

	/* Animate the dice. */
	$.fn.animShowDie = function(delay, callback) {
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
	$.fn.animShowDots = function() {
		var dots = this.find('.dot');
		for(var i = 0; i < dots.length; i++) {
			$(dots[i]).velocity('transition.expandIn', { duration: 500 });
		}
		return this;
	}
	$.fn.moveDot = function(top, left) {
		this.velocity({ top: top, left: left }, { easing: 'ease-in-out', duration: 500, queue: false });
	}
	$.fn.animDiceDots = function(number) {
		var dots = this.find('.dot');
		switch(number) {
			case 1:
				$(dots[0]).moveDot(20, 20);
				$(dots[1]).moveDot(20, 20);
				$(dots[2]).moveDot(20, 20);
				$(dots[3]).moveDot(20, 20);
				$(dots[4]).moveDot(20, 20);
				$(dots[5]).moveDot(20, 20);
				break;
			case 2:
				$(dots[0]).moveDot(20, 12);
				$(dots[1]).moveDot(20, 12);
				$(dots[2]).moveDot(20, 12);
				$(dots[3]).moveDot(20, 28);
				$(dots[4]).moveDot(20, 28);
				$(dots[5]).moveDot(20, 28);
				break;
			case 3:
				$(dots[0]).moveDot(20, 8);
				$(dots[1]).moveDot(20, 8);
				$(dots[2]).moveDot(20, 20);
				$(dots[3]).moveDot(20, 20);
				$(dots[4]).moveDot(20, 32);
				$(dots[5]).moveDot(20, 32);
				break;
			case 4:
				$(dots[0]).moveDot(12, 12);
				$(dots[1]).moveDot(28, 12);
				$(dots[2]).moveDot(12, 12);
				$(dots[3]).moveDot(28, 28);
				$(dots[4]).moveDot(12, 28);
				$(dots[5]).moveDot(28, 28);
				break;
			case 5:
				$(dots[0]).moveDot(12, 12);
				$(dots[1]).moveDot(28, 12);
				$(dots[2]).moveDot(20, 20);
				$(dots[3]).moveDot(20, 20);
				$(dots[4]).moveDot(12, 28);
				$(dots[5]).moveDot(28, 28);
				break;
			case 6:
				$(dots[0]).moveDot(12, 8);
				$(dots[1]).moveDot(28, 8);
				$(dots[2]).moveDot(12, 20);
				$(dots[3]).moveDot(28, 20);
				$(dots[4]).moveDot(12, 32);
				$(dots[5]).moveDot(28, 32);
				break;
		}
	}

	/* Animate the index page intro */
	$.fn.animIndexIntro = function(callback) {
		this.velocity('transition.slideUpIn', { duration: 500, delay: 100, complete: callback });
		return this;
	}
})(jQuery);
