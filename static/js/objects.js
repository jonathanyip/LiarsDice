/* Objects */

/* DiceGroup object */
var DiceGroup = function(parent) {
	this.parent = $(parent);
	this.dice = [];
	for(var i = 0; i < 3; i++) {
		var die = $('<div class="die"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>');
		this.dice.push(die);
		this.parent.append(die);
	}

	this.timerFunction;
}

/* Shows the dice, in a pretty cool fashion. */
DiceGroup.prototype.showDice = function(callback) {
	var self = this;

	self.dice[0].animShowDie(0);
	self.dice[1].animShowDie(150);
	self.dice[2].animShowDie(300, callback);
}

/* Animates the dots appearing. */
DiceGroup.prototype.showDots = function(callback) {
	var self = this;

	self.dice[0].animShowDots();
	self.dice[1].animShowDots();
	self.dice[2].animShowDots();

	typeof callback === 'function' && callback();
}

/* Beings the randomizing animation. */
DiceGroup.prototype.randomize = function() {
	var self = this;
	self.timerFunction = setInterval(function() {
		for(var i = 0; i < self.dice.length; i++) {
			var random = Math.floor(Math.random() * 6) + 1;
			self.dice[i].animDiceDots(random);
		}
	}, 1000);
}

/* Sets the dice to these values, in this order. */
DiceGroup.prototype.setValue = function(values) {
	var self = this;
	for(var i = 0; i < values.length && i < self.dice.length; i++) {
		self.dice[i].animDiceDots(values[i]);
	}
}

/* Stops the randomize animation. */
DiceGroup.prototype.derandomize = function() {
	clearInterval(this.timerFunction);
}
