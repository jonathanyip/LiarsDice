/* Objects */
var Die = require('./Die.js');

/* Player Constructor */
var Player = function(playerName, socketID) {
	this.name = name;
	this.id = socketID;
	this.dice = [new Die(), new Die(), new Die()];

	this.stillAlive = true;
}

/* Class Functions */
/* Randomizes all the player's dice */
Player.prototype.randomizeDice = function() {
	for(var i = 0; i < this.dice.length; i++) {
		this.dice[i].randomize.call(this.dice[i]);
	}
}

/* Resets player to a near perfect state */
Player.prototype.reset = function() {
	this.dice = [new Die(), new Die(), new Die()];
	this.stillAlive = true;
}

module.exports = Player;
