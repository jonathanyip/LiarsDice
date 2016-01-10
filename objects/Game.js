/* Objects */
var Player = require('./Player.js');

/* Game Constructor */
var Game = function(gameID) {
	this.id = gameID;
	this.players = [];

	this.started = false;
}

/* Class Functions */
/* Creates a new player, and puts them in the game */
Game.prototype.joinGame = function(io, socket, playerName) {
	// Create a new player
	var player = new Player(playerName, socket.id);
	this.players.push(player);

	// Set user's socket variables
	socket.game = this;
	socket.player = player;

	// Tell all other players that their player list needs to be updated
	io.sockets.in(this.id).emit('Game', { info: 'UpdatePlayers', 'PlayerList': this.getPlayerNames() });
}

/* Removes the following player from the game */
Game.prototype.leaveGame = function(io, player) {
	// Remove this player from our list
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].ID === player.ID) {
			this.players.splice(i, 1);
			break;
		}
	}

	// Tell other players that they need to update their list
	io.sockets.in(this.id).emit('Game', { info: 'UpdatePlayers', 'PlayerList': this.getPlayerNames() });
}

/* Returns a list of player names */
Game.prototype.getPlayerNames = function() {
	var names = [];
	for(var i = 0; i < this.players.length; i++) {
		names.push(this.players[i].name);
	}
	return names;
}

module.exports = Game;
