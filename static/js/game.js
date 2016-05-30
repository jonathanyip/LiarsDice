var diceGroup = new DiceGroup('#game-dice-group');

$(document).ready(function() {
	var socket = io();

	/* Game states, so we know what we're doing later. */
	var states = { NAME: 1, LOBBY: 2, STARTED: 3 };
	var gameState = states.NAME;

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
			case 'GO_TO_LOBBY': {
				$('#game-over-page').animHidePage();
				$('#game-page').animHidePage();
			}
			case 'JOINED_GAME': {
				gameState = states.LOBBY;

				$('#lobby-id').text(GameID);
				$('#name-page').animHidePage(function() {
					$('#lobby-page').animShowPage();
				});

				break;
			}
			case 'UPDATE_PLAYERS': {
				$('#lobby-players').html("");
				for(var i = 0; i < msg['PLAYER_LIST'].length; i++) {
					$('#lobby-players').append("<li>" + msg['PLAYER_LIST'][i] + "</li>");
				}
				break;
			}
			case 'STARTED_GAME': {
				gameState = states.STARTED;
				$('#lobby-page').animHidePage();
				break;
			}
			case 'PREROUND_UPDATE': {
				if(!$('#game-page').is(':visible')) {
					$('#game-page').animShowPage();
				}
				
				diceGroup.setDiceCount.call(diceGroup, msg['DICE_COUNT']);

				$('#game-stats').animHidePage();

				diceGroup.showDice.call(diceGroup, function() {
					diceGroup.showDots.call(diceGroup);
				});

				diceGroup.randomize.call(diceGroup, 200);
				break;
			}
			case 'ROUND_UPDATE': {
				diceGroup.derandomize.call(diceGroup);

				diceGroup.setValue.call(diceGroup, msg['DIE_LIST']);
				$('#game-remaining-dice').text(msg['DICE_TOTAL']);

				$('#game-stats').animShowPage();
				break;
			}
			case 'TURN_UPDATE': {
				$('#game-select').animHidePage();
				$('#game-final-details').animHidePage();
				$('#game-details').animHidePage();

				$('#game-btn-error').hide();
				$('#game-select-error').hide();

				if(msg['YOUR_TURN'] === true) {
					$('#game-your-turn').animShowPage();
					$('#game-other-turn').animHidePage();
				} else {
					$('#game-current-player').text(msg['CURRENT_PLAYER']);
					$('#game-your-turn').animHidePage();
					$('#game-other-turn').animShowPage();
				}

				$('#game-details').animShowPage();

				if(msg['CURRENT_BET'] !== null) {
					$('#game-last-player').text(msg['CURRENT_BET'].player.name);
					$('#game-last-number').text(msg['CURRENT_BET'].number);

					var type = "";
					switch(msg['CURRENT_BET'].type) {
						case 1: type = "one"; break;
						case 2: type = "two"; break;
						case 3: type = "three"; break;
						case 4: type = "four"; break;
						case 5: type = "five"; break;
						case 6: type = "six"; break;
					}

					$('#game-last-type').text(type);

					// Clear old settings values.
					$('#game-select-number').val('');
					$('#game-select-type li').removeClass('active');

					$('#game-last-bet').animShowPage();
				} else {
					$('#game-last-bet').animHidePage();
				}

				break;
			}
			case 'FINAL_UPDATE': {
				$('#game-select').animHidePage();
				$('#game-details').animHidePage(function() {
					$('#game-final-details').animShowPage();
				});

				switch(msg['ACTION']) {
					case 'SPOT_ON': {
						if(msg['SPOT_ON']) {
							$('#game-final-details .users-group').html("<p><span class=\"user\">" + msg['PLAYER'] + "</span> said Spot On! And they were right!</p><p>Everybody except <span class=\"user\">" + msg['PLAYER'] + "</span> will lose a die.</p>");
						} else {
							$('#game-final-details .users-group').html("<p><span class=\"user\">" + msg['PLAYER'] + "</span> said Spot On! But they were wrong...</p><p><span class=\"user\">" + msg['PLAYER'] + "</span> will lose a die.</p>");
						}
						break;
					}
					case 'BS': {
						if(msg['BS']) {
							$('#game-final-details .users-group').html("<p><span class=\"user\">" + msg['PLAYER'] + "</span> said BS! And they were right!</p><p><span class=\"user\">" + msg['PREV_PLAYER'] + "</span> will lose a die.</p>");
						} else {
							$('#game-final-details .users-group').html("<p><span class=\"user\">" + msg['PLAYER'] + "</span> said BS! But they were wrong...</p><p>So, <span class=\"user\">" + msg['PLAYER'] + "</span> will lose a die.</p>");
						}
						break;
					}
				}
				break;
			}
			case 'GAME_OVER': {
				$('#game-page').animHidePage(function() {
					$('#game-winner').text(msg['WINNER']);
					$('#game-over-page').animShowPage();
				});
				break;
			}
		}
		switch(msg.error) {
			case 'NAME_ALREADY_EXISTS': {
				$('#name-error').animShowError("<p>Oops, but that name's already been taken!</p>");
				break;
			}
			case 'GAME_ALREADY_STARTED': {
				$('#name-error').animShowError("<p>Um. This game's already started.</p><p>Try again when the current game has finished!</p>");
				break;
			}
			case 'INVALID_BET': {
				$('#game-select-error').animShowError("<p>This bet is too small. Try making it bigger.</p>");
				break;
			}
			case 'CANNOT_BET': {
				$('#game-btn-error').animShowError("<p>You can't choose this option. There's no bet yet!</p>");
			}
		}
	})

	/* Create a new player. */
	$('#name-name').bind('keypress', function(event) {
		if(event.keyCode == 13) $('#name-btn').click();
	});
	$('#name-btn').click(function() {
		if($('#name-name').val()) {
			socket.emit('GAME_MANAGER', { tag: 'JOIN_GAME', 'GAME_ID': GameID, 'PLAYER_NAME': $('#name-name').val() });
		} else {
			$('#name-error').animShowError("<p>You need a name! Try something interesting, like ZUMBA.</p><p>Or, just your name. That's fine too.</p>");
		}
	});

	/* Checks whether they want to start the game. */
	$('#lobby-start-btn').click(function() {
		socket.emit('GAME', { tag: 'START_GAME' });
	});

	/* They want to select a bet. */
	$('#game-btn-select-bet').click(function() {
		$('#game-details').animHidePage(function() {
			$('#game-select').animShowPage();
		});
	});

	/* They want to go back. */
	$('#game-btn-back').click(function() {
		$('#game-select').animHidePage(function() {
			$('#game-details').animShowPage();
		});
	});

	/* They want to bet. */
	$('#game-btn-bet').click(function() {
		var number = parseInt($('#game-select-number').val());
		var type = $('#game-select-type li.active').data('type');

		// Check if the things they put is valid.
		if(isNaN(number) || number <= 0) {
			$('#game-select-error').animShowError("<p>Please put a positive number in the blank!</p>");
			return;
		}

		if(type === undefined) {
			$('#game-select-error').animShowError("<p>Please choose a dice type!</p>");
			return;
		}

		socket.emit('GAME', { tag: 'DO_ACTION', 'ACTION': 'BET', 'NUMBER': number, 'TYPE': type });
	});

	/* They want to say BS. */
	$('#game-btn-bs').click(function() {
		socket.emit('GAME', { tag: 'DO_ACTION', 'ACTION': 'BS' });
	});

	/* They want to say Spot On. */
	$('#game-btn-spot-on').click(function() {
		socket.emit('GAME', { tag: 'DO_ACTION', 'ACTION': 'SPOT_ON' });
	});

	/* Go to the next round */
	$('#game-btn-next-round').click(function() {
		socket.emit('GAME', { tag: 'DO_ROUND' });
	})

	$('#game-btn-lobby').click(function() {
		socket.emit('GAME', { tag: 'GO_TO_LOBBY' });
	})

	/* Select Box Animations */
	$('.select-group .select li').click(function() {
		$('.select-group .select li').removeClass('active');
		$(this).addClass('active');
	});

	/* Startup actions! */
	if(typeof GameID !== 'undefined') {
		socket.emit('GAME_MANAGER', { tag: 'DOES_GAME_EXIST', 'GAME_ID': GameID });
	} else {
		utils.setPage();
	}
});
