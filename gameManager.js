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

	socket.emit('GameManager', { info: 'CreatedGame', 'GameID': gameID });
	console.log("[GameManager] Created new game {" + gameID + "}");
}

/* Checks whether this game exists, and sends info back to client */
module.exports.doesGameExist = function(socket, gameID) {
	if(gameID in games) {
		socket.emit('GameManager', { info: 'GameExists', 'GameID': gameID });
		console.log("[GameManager] Game {" + gameID + "} exists!");
	} else {
		socket.emit('GameManager', { error: 'GameDoesNotExist' });
		console.log("[GameManager] Game {" + gameID + "} does not exist!");
	}
}

/* If the game exists, run callback passed the game */
module.exports.getGame = function(socket, gameID, callback) {
	if(gameID in games) {
		callback(games[gameID]);
	} else {
		socket.emit('GameManager', { error: 'GameDoesNotExist' });
		console.log("[GameManager] Game {" + gameID + "} does not exist!");
	}
}

/* Gets the game and player from the socket, if they exist */
module.exports.getSocketGP = function(socket, callback, showErrors) {
	showErrors = (showErrors !== false);

	if("game" in socket && "player" in socket) {
		callback(socket.game, socket.player);
	} else {
		if(showErrors) {
			socket.emit('GameManager', { error: 'BadSocketEnvironment' });
			console.log("[GameManager] Player has a bad socket environment!");
		}
	}
}

/*
 * Checks if the following gameID is empty,
 * because if it is, there is no longer anybody playing,
 * and we should get rid of it
 */
module.exports.checkEmptyGames = function(gameID) {
	if(gameID in games) {
		if(games[gameID].players.length === 0) {
			console.log("[GameManager] Game {" + gameID + "} is empty, so we're deleting it.");
			delete games[gameID];
		}
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
