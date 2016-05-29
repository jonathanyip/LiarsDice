$(document).ready(function() {
	var socket = io();

	/* Various game variables */
	// Game States, so we know what we're doing later
	var states = {
		NAME: 1,
		LOBBY: 2
	};

	var gameState = states.NAME;

	/* Create a new player. */
	$('#name-btn').click(function() {
		if($('#name-name').val()) {
			socket.emit('GAME_MANAGER', { tag: 'JOIN_GAME', 'GAME_ID': GameID, 'PLAYER_NAME': $('#name-name').val() });
		}
	});

	/* Handle messages from the GameManager */
	socket.on('GAME_MANAGER', function(msg) {
		switch(msg.tag) {
			case 'GAME_EXISTS': {
				$('#name-page').animShowPage();
				break;
			}
		}
		switch(msg.error) {
			case 'BAD_SOCKET_ENVIRONMENT': {
				alert('Your socket environment has been messed up! Please try restarting the game.');
				break;
			}
			case 'GAME_DOES_NOT_EXIST': {
				utils.setPage();
				break;
			}
		}
	});

	/* Handle messages from the Game */
	socket.on('GAME', function(msg) {
		switch(msg.tag) {
			case 'JOINED_GAME': {
				gameState = states.LOBBY;

				$('#wait-id').text(GameID);
				$('#name-page').animHidePage(function() {
					$('#wait-page').animShowPage();
				});
			}
			case 'UPDATE_PLAYERS': {
				if(gameState === states.NAME || gameState === states.LOBBY) {
					$('#wait-players').html("");
					for(var i = 0; i < msg['PLAYER_LIST'].length; i++) {
						$('#wait-players').append("<li>" + msg['PLAYER_LIST'][i] + "</li>");
					}
				}
				break;
			}
		}
		switch(msg.error) {
			case 'NAME_ALREADY_EXISTS': {
				$('#name-error').animShowError();
				break;
			}
		}
	})

	/* Startup actions! */
	if(typeof GameID !== 'undefined') {
		socket.emit('GAME_MANAGER', { tag: 'DOES_GAME_EXIST', 'GAME_ID': GameID });
	} else {
		utils.setPage();
	}
});
