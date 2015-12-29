var Player = function(socketId, game, name) {
	/* Room Variables */
	this.id = socketId;
	this.game = game;

	this.name = name;
}

module.exports = Player;