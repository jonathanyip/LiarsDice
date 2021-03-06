/* Objects */
var Die = require('./Die.js');

/* Player Constructor */
var Player = function(playerName, socketID) {
	this.name = playerName;
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

/* Removes a die */
Player.prototype.removeDie = function() {
	if(this.dice.length > 0) {
		this.dice.pop();
	}
}

/* */
Player.prototype.countNumOfDie = function(diceNum) {
	var numOfDice = 0;
	for(var i = 0; i < this.dice.length; i++) {
		if(this.dice[i].number === diceNum) {
			numOfDice += 1;
		}
	}
	return numOfDice;
}

module.exports = Player;
