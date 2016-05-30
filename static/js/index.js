$(document).ready(function() {
	var socket = io();

	/* Handle messages from the GameManager */
	socket.on('GAME_MANAGER', function(msg) {
		switch(msg.tag) {
			case 'GAME_EXISTS':
			case 'CREATED_GAME': {
				utils.setPage(msg['GAME_ID']);
				break;
			}
		}
		switch(msg.error) {
			case 'GAME_DOES_NOT_EXIST': {
				$('#join-error').animShowError("<p>We can't seem to find this game! Sorry.</p><p>Did you mean to <a href=\"#\" id=\"join-new-game\">make a new game instead?</a></p>");
				break;
			}
		}
	});

	/* Show the join game page */
	$('#index-join-btn').click(function() {
		$('#index-page').animHidePage(function() {
			$('#join-page').animShowPage();
		});
	});

	/* Checks whether this game actually exists */
	$('#join-game-key').bind('keypress', function(event) {
		if(event.keyCode == 13) $('#join-btn').click();
	});
	$('#join-btn').click(function() {
		socket.emit('GAME_MANAGER', { tag: 'DOES_GAME_EXIST', 'GAME_ID': $('#join-game-key').val() });
	});

	/* If they want to play a new game */
	$('#index-play-btn').click(function(event) {
		event.preventDefault();
		socket.emit('GAME_MANAGER', { tag: 'CREATE_GAME' });
	});
	$('#join-page').on('click', '#join-new-game', function() {
		event.preventDefault();
		socket.emit('GAME_MANAGER', { tag: 'CREATE_GAME' });
	});

	/* Startup animations! */
	var diceGroup = new DiceGroup('#index-dice-group-hero');

	diceGroup.showDice.call(diceGroup, function() {
		$('#index-main').animIndexIntro(function() {
			diceGroup.showDots.call(diceGroup);
		});
	});

    diceGroup.randomize.call(diceGroup);
});
