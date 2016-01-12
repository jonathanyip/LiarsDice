module.exports = function(server) {
	var io = require('socket.io')(server);
	var gameManager = require('./gameManager.js');

	io.on('connection', function(socket) {
		console.log("A new user has connected!");

		/*
		 * Handle Incoming Messages:
		 * Use msg.info for the identifying heading
		 * Use msg.error for any errors
		 */

		/* From General (All purpose messages, but usually for pre-game things) */
		socket.on('General', function(msg) {
			switch(msg.info) {
				case 'CreateGame': {
					gameManager.createGame(socket);
					break;
				}
				case 'DoesGameExist': {
					gameManager.doesGameExist(socket, msg['GameID']);
					break;
				}
				case 'JoinGame': {
					gameManager.getGame(socket, msg['GameID'], function(game) {
						game.joinGame.call(game, io, socket, msg['PlayerName']);
					});
					break;
				}
			}
		});

		/* From Game (Messages pertaining to the game itself) */
		socket.on('Game', function(msg) {
			switch(msg.info) {
				case 'StartGame': {
					gameManager.getSocketGP(socket, function(game, player) {
						game.startGame.call(game, io);
					});
					break;
				}
				case 'DoRound': {
					gameManager.getSocketGP(socket, function(game, player) {
						game.doRound.call(game, io);
					});
					break;
				}
				case 'doAction': {
					gameManager.getSocketGP(socket, function(game, player) {
						/*
						 * TODO: Parse info here, or pass message into doAction()?
						 */
						game.doAction.call(game, io);
					})
					break;
				}
				case 'GoToLobby': {
					gameManager.getSocketGP(socket, function(game, player) {
						game.goToLobby.call(game, io);
					});
					break;
				}
			}
		});

		/* If the user disconnects */
		socket.on('disconnect', function(msg) {
			gameManager.getSocketGP(socket, function(game, player) {
				game.leaveGame.call(game, player);
				gameManager.checkEmptyGames(game.id);
			});
		});
	});
};
