$(document).ready(function() {
	/* Helper functions */
	function redirectTo(path) {
		window.location.href = "/" + path;
	}

	/* Initialize the socket for some communication */
	var socket = io();

	/* Show Join Game Page */
	$('#index-join-game').click(function() {
		$('#index-page').velocity('transition.slideUpOut', {
			duration: 100,
			complete: function() {
				$('#join-page').velocity('transition.slideUpIn', { duration: 100 });
			}
		});
	});

	/* Checks whether this game exists */
	$('#join-find-game').click(function() {
		socket.emit('General', { info: 'DoesGameExist', 'GameID': $("#join-game-key").val() });
	});

	/* If they want to play a new game */
	$('#index-play-game, #join-play-game').click(function(event) {
        event.preventDefault();
		socket.emit('General', { info: 'CreateGame' });
	});

	/* Handle messages from the server */
	/* From the GameManager */
	socket.on('GameManager', function(msg) {
		switch(msg.info) {
			case 'GameExists': {
				redirectTo(msg['GameID']);
				break;
			}
			case 'GameDoesNotExist': {
				if($('#join-error').css('display') === 'none') {
					$('#join-error').velocity('slideDown', { duration: 250, queue: false })
									.velocity('transition.slideRightIn', { delay: 250, duration: 250 });
				} else {
					$('#join-error').velocity('transition.slideRightIn', { delay: 250, duration: 250 });
				}
				break;
			}
			case 'CreatedGame': {
				redirectTo(msg['GameID']);
				break;
			}
		}
	});
});
