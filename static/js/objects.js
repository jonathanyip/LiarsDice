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

DiceGroup.prototype.showDice = function(callback) {
    var self = this;

    self.dice[0].animShowDie(0);
    self.dice[1].animShowDie(150);
    self.dice[2].animShowDie(300, callback);
}

DiceGroup.prototype.showDots = function(callback) {
    var self = this;

    self.dice[0].animShowDots();
    self.dice[1].animShowDots();
    self.dice[2].animShowDots();

    typeof callback === 'function' && callback();
}

DiceGroup.prototype.randomize = function() {
    var self = this;
    self.timerFunction = setInterval(function() {
        for(var i = 0; i < self.dice.length; i++) {
            var random = Math.floor(Math.random() * 6) + 1;
            self.dice[i].animDiceDots(random);
        }
    }, 1000);
}

DiceGroup.prototype.derandomize = function() {
    clearInterval(this.timerFunction);
}
