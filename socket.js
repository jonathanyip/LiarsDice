module.exports = function(server) {
	var io = require('socket.io')(server);
	var RoomManager = require('./managers/RoomManager.js');

	io.on('connection', function(socket) {
		console.log("A new user has connected!");

		var game = null;
		var player = null;

		/* Create a new game */
		socket.on('createGame', function(msg) {
			socket.emit('createGame_res', { 'gameId': RoomManager.createGame() });
		});
		/* Join/Leave a game */
		socket.on('joinGame', function(msg) {
			RoomManager.joinGame(msg.playerName, msg.gameId, socket.id, function(err, new_game, new_player) {
				if(err === false) {
					game = new_game;
					player = new_player;
				} else {
					socket.emit('joinGame_res', { 'error': 'GameDoesNotExist' })
				}
			});
		});
		socket.on('disconnect', function(msg) {
			RoomManager.leaveGame(game, player);
		});
	});
};