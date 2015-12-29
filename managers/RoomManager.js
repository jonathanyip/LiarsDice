/* Array to store games */
var games = [];

/* Load Objects */
var Game = require('../objects/game.js');
var Player = require('../objects/player.js');

module.exports.createGame = function(callback) {
	var game = new Game(exports.randomId(5));
	games.push(game);

	return game.id;
}

module.exports.joinGame = function(playerName, gameId, socketId, callback) {
	var game = exports.getGame(gameId);

	if(game !== null) {
		var player = new Player(socketId, playerName, game);
		game.players.push(player);
		players.push(player);

		callback(false, game, player);
		return;
	}

	callback(true);
}

module.exports.leaveGame = function(game, player) {
	if(game == null || player === null) {
		return;
	}

	for(var i = games.length - 1; i >= 0; i--) {
		if(games[i].id === game.id) {
			for(var j = games[i].players.length - 1; j >= 0; j--) {
				if(games[i].players[j].id === player.id) {
					games[i].players.splice(j, 1);
					break;
				}
			}

			if(games[i].players.length === 0) games.splice(i, 1);
			return;
		}
	}
}

module.exports.getGame = function(gameId) {
	for(var i = 0; i < games.length; i++) {
		if(games[i].id === gameId) return games[i];
	}

	return null;
}

module.exports.randomId = function(length) {
	var id = "";
	var validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	for(var i = 0; i < length; i++) {
		id += chars[Math.floor(Math.random() * validChars.length)];
	}

	return id;
}