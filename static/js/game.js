$(document).ready(function() {
	var socket = io();

	/* Various game variables */
	// Game States, so we know what we're doing later
	var states = {
		NAME: 1,
		WAITING: 2
	};
	var gameState = states.NAME;

	/* Create a new player. */
	$('#name-btn').click(function() {
		if($('#name-name').val()) {
			socket.emit('General', { info: 'JoinGame', 'GameID': GameID, 'PlayerName': $('#name-name').val() });
		}
	});

	/* Handle messages from the server */
	socket.on('GameManager', function(msg) {
		switch(msg.info) {
			case 'GameExists': {
				$('#name-page').animShowPage();
				break;
			}
		}
		switch(msg.error) {
			case 'BadSocketEnvironment': {
				alert('Your socket environment has been messed up! Please try and restart the game.');
				break;
			}
			case 'GameDoesNotExist': {
				utils.setPage();
				break;
			}
		}
	});
	socket.on('Game', function(msg) {
		switch(msg.info) {
			case 'UpdatePlayers': {
				if(gameState === states.NAME) {
					gameState = states.WAITING;
					$('#wait-id').text(GameID);
					$('#name-page').animHidePage(function() {
						$('#wait-page').animShowPage();
					});
				}
				if(gameState === states.WAITING) {
					$('#wait-players').html("");
					for(var i = 0; i < msg['PlayerList'].length; i++) {
						$('#wait-players').append("<li>" + msg['PlayerList'][i] + "</li>");
					}
				}
				break;
			}
		}
		switch(msg.error) {
			case 'NameAlreadyExists': {
				$('#name-error').animShowError();
				break;
			}
		}
	})

	/* Startup actions! */
	if(typeof GameID !== 'undefined') {
		socket.emit('General', { info: 'DoesGameExist', 'GameID': GameID });
	} else {
		utils.setPage();
	}
});
