module.exports = function(server) {
	var io = require('socket.io')(server);
	var gameManager = require('./gameManager.js');

	io.on('connection', function(socket) {
		console.log("A new user has connected!");

		/*
		 * Recieve Messages From Client
		 * All server responses begin with "SConfirm_" + Message Tag
		 *
		 * Can respond with:
		 * "Response" = Message of what happened (usually success).
		 * "Error" = Any errors that might have occured.
		 * "..." = Any other responses are custom variables for that situation.
		 */
		socket.on('CreateGame', function(msg) {
			socket.emit('SConfirm_CreateGame', { 'GameID': RoomManager.createGame() });
		});

		socket.on('DoesGameExist', function(msg) {
			socket.emit('SConfirm_DoesGameExist', { 'Response': gameManager.doesGameExist(msg["GameID"]) });
		})

		socket.on('JoinGame', function(msg) {
			var player = gameManager.joinGame(msg["PlayerName"], msg["GameID"], socket.id);
			if(socket.player !== null) {
				socket.player = player;
				socket.emit('SConfirm_JoinGame', { 'Response': "JoinedGame" });
			} else {
				socket.emit('SConfirm_JoinGame', { 'Error': "GameDoesNotExist" });
			}
		});

		socket.on('disconnect', function(msg) {
			if("player" in socket) {
				gameManager.leaveGame(socket.player);
			}
		});
	});
};