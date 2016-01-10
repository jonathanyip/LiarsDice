/* Die Constructor */
var Die = function() {
	this.number = 1;
}

/* Class Functions */
/* Changes the die into a new random number (1-6) */
Die.prototype.randomize = function() {
	this.number = Math.floor(Math.random() * 6) + 1;
}

module.exports = Die;
