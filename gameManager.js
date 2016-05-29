/* A dictionary of all current games */
var games = {};

/* Objects */
var Game = require('./objects/Game.js');

/* Module Functions */
/* Create a new game, and sends the GameID back to the client */
module.exports.createGame = function(socket) {
	var gameID = "";
	do { gameID = exports.randomID(5); } while(gameID in games);

	var game = new Game(gameID);
	games[gameID] = game;

	socket.emit('GAME_MANAGER', { tag: 'CREATED_GAME', 'GAME_ID': gameID });
	console.log("[GameManager] Created new game {" + gameID + "}.");
}

/* Checks whether this game exists, and sends details back to client */
module.exports.doesGameExist = function(socket, gameID) {
	if(gameID in games) {
		socket.emit('GAME_MANAGER', { tag: 'GAME_EXISTS', 'GAME_ID': gameID });
		console.log("[GameManager] By request, game {" + gameID + "} exists!");
	} else {
		socket.emit('GAME_MANAGER', { error: 'GAME_DOES_NOT_EXIST' });
		console.log("[GameManager] By request, game {" + gameID + "} does not exist!");
	}
}

/* If the game exists, pass game to callback */
module.exports.getGame = function(socket, gameID, callback) {
	if(gameID in games) {
		callback(games[gameID]);
	} else {
		socket.emit('GAME_MANAGER', { error: 'GAME_DOES_NOT_EXIST' });
		console.log("[GameManager] Game {" + gameID + "} does not exist!");
	}
}

/* Gets the game and player from the socket, if they exist */
module.exports.getSocketGP = function(socket, callback) {
	showErrors = (showErrors !== false);

	if("game" in socket && "player" in socket) {
		callback(socket.game, socket.player);
	} else {
		socket.emit('GAME_MANAGER', { error: 'BAD_SOCKET_ENVIRONMENT' });
		console.log("[GameManager] A player has a bad socket environment!");
	}
}

/*
 * Checks if the following game is empty,
 * because if it is, there is no longer anybody playing,
 * and we should get rid of it...
 */
module.exports.checkIfEmpty = function(game) {
	if(game.players.length === 0) {
		console.log("[GameManager] Game {" + game.id + "} is empty, so we're deleting it. Okay?");
		delete games[game.id];
	}
}

/* Generate a random ID for a new game */
module.exports.randomID = function(length) {
	var randomID = "";
	var validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	for(var i = 0; i < length; i++) {
		randomID += validChars[Math.floor(Math.random() * validChars.length)];
	}

	return randomID;
}
