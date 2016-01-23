$(document).ready(function() {
	/* Show the join game page */
	$('#index-join-game').click(function() {
		$('#index-page').animHidePage(function() {
			$('#join-page').animShowPage();
		});
	});

	/* Checks whether this game actually exists */
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
			case 'GameExists':
			case 'CreatedGame': {
				utils.setHash(msg['GameID']);
				break;
			}
			case 'GameDoesNotExist': {
				$('#join-error').animShowError(0);
				break;
			}
		}
	});
});
