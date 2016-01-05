var games = {};

/* Objects */
var Game = require('./objects/Game.js');
var Player = require('./objects/Player.js');

/* Create a new game */
module.exports.createGame = function() {
	var gameID = "";
	do { gameID = exports.randomID(5); } while(gameID in games);

	var game = new Game(gameID);
	games[gameID] = game;
}

/* Checks whether this game exists */
modules.exports.doesGameExist = function(gameID) {
	return (gameID in games);
}

/*
 * Joins a player to a given game
 * Returns a player objects if successful.
 */
modules.exports.joinGame = function(playerName, gameID, socketID) {
	if(gameID in games) {
		var game = games[gameID];
		var player = new Player(playerName, game, socketID);

		game.players.push(player);

		return player;
	}

	return null;
}

/* Makes player leave a game */
module.exports.leaveGame = function(player) {
	for(var i = player.game.players.length - 1; i >= 0; i--) {
		if(player.game.players[i].ID === player.ID) {
			player.game.players.splice(i, 1);
			break;
		}
	}

	if(player.game.players.length === 0) {
		delete games[player.game.ID];
	}
}

/* Generate a random ID for a game */
module.exports.randomID = function(length) {
	var randomID = "";
	var validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	for(var i = 0; i < length; i++) {
		randomID += chars[Math.floor(Math.random() * validChars.length)];
	}

	return randomID;
}