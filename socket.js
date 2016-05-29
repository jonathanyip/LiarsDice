module.exports = function(server) {
	var io = require('socket.io')(server);
	var gameManager = require('./gameManager.js');

	io.on('connection', function(socket) {
		console.log("[Socket] New user connected!");

		/*
		 * Handle Incoming Messages:
		 * Use msg.tag for the identifying heading
		 * Use msg.error for any errors
		 */

		/* Messages to the Game Manager */
		socket.on('GAME_MANAGER', function(msg) {
			switch(msg.tag) {
				case 'CREATE_GAME': {
					gameManager.createGame(socket);
					break;
				}
				case 'DOES_GAME_EXIST': {
					gameManager.doesGameExist(socket, msg['GAME_ID']);
					break;
				}
				case 'JOIN_GAME': {
					gameManager.getGame(socket, msg['GAME_ID'], function(game) {
						game.joinGame.call(game, io, socket, msg['PLAYER_NAME']);
					});
					break;
				}
			}
		});

		/* Messages to the Game Object */
		socket.on('GAME', function(msg) {
			switch(msg.tag) {
				case 'START_GAME': {
					gameManager.getSocketGP(socket, function(game, player) {
						game.startGame.call(game, io);
					});
					break;
				}
				case 'DO_ROUND': {
					gameManager.getSocketGP(socket, function(game, player) {
						game.doRound.call(game, io);
					});
					break;
				}
				case 'DO_ACTION': {
					gameManager.getSocketGP(socket, function(game, player) {
						game.doAction.call(game, io, player, msg['ActionMsg']);
					});
					break;
				}
				case 'GO_TO_LOBBY': {
					gameManager.getSocketGP(socket, function(game, player) {
						game.goToLobby.call(game, io);
					});
					break;
				}
			}
		});

		/* If the user disconnects suddenly. */
		socket.on('disconnect', function(msg) {
			if("game" in socket && "player" in socket) {
				socket.game.leaveGame.call(socket.game, io, socket, socket.player);
				gameManager.checkIfEmpty(socket.game);
			}
		});
	});
};
