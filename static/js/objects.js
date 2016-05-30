/* Objects */

/* DiceGroup object */
var DiceGroup = function(parent, visible) {
	this.parent = $(parent);
	this.dice = [];
	this.visible = false;

	this.setDiceCount(3);

	this.timerFunction = null;
}

/* Shows the dice, in a pretty cool fashion. */
DiceGroup.prototype.showDice = function(callback) {
	var self = this;

	if(!self.visible) {
		self.dice[0].animShowDie(0);
		self.dice[1].animShowDie(150);
		self.dice[2].animShowDie(300, callback);
	}

	self.visible = true;
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
DiceGroup.prototype.randomize = function(timeout) {
	var self = this;
	timeout = timeout || 1000;

	self.timerFunction = setInterval(function() {
		for(var i = 0; i < self.dice.length; i++) {
			var random = Math.floor(Math.random() * 6) + 1;
			self.dice[i].animDiceDots(random, Math.floor(timeout / 2));
		}
	}, timeout);
}

/* Sets the dice to these values, in this order. */
DiceGroup.prototype.setValue = function(values) {
	var self = this;
	for(var i = 0; i < values.length && i < self.dice.length; i++) {
		self.dice[i].animDiceDots(values[i].number);
	}
}

/* Stops the randomize animation. */
DiceGroup.prototype.derandomize = function() {
	if(this.timerFunction !== null) {
		clearInterval(this.timerFunction);
		this.timerFunction = null;
	}
}

/* Sets the number of dice. */
DiceGroup.prototype.setDiceCount = function(diceCount) {
	var self = this;

	// Handle empty cases
	if(diceCount === 0) {
		self.parent.html("<p>You have no more dice. Sucks. :(</p>");
		self.dice = [];
		return;
	}

	// Handle reset cases
	if(self.dice.length === 0 && diceCount > 0) {
		self.parent.html("");
	}

	while(self.dice.length > diceCount) {
		var popped = self.dice.pop();
		popped.animHideDie(0, (function(popped) {
			return function() { popped.remove(); }
		})(popped));
	}
	while(self.dice.length < diceCount) {
		var die = $('<div class="die"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>');
		self.dice.push(die);
		self.parent.append(die);
	}
}
