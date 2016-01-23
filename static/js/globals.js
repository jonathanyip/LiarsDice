/*
 * Globals.js:
 * Contains everything including utils, global variables, and startup things.
 */

/***********
 * Objects *
 ***********/
/* Die object: Has prototypes for the animation */
var Die = function(parent) {
    this.parent = $(parent);

    /* The constructor adds the die element for you */
    this.element = $('<div class="die"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>').hide();
    this.parent.append(this.element);
    this.timerFunction;
}
/* Do dice intro */
Die.prototype.introShow = function(options, callback) {
    this.element.animDiceIntro(options, callback);
}
Die.prototype.showDots = function() {
    this.element.animShowDots();
}
/* Randomize dice animation */
Die.prototype.randomize = function() {
    var self = this.element;
    this.timerFunction = setInterval(function() {
        var random = Math.floor(Math.random() * 6) + 1;
        self.animDiceDots(random);
    }, 1000);
}
/* Stops die randomization */
Die.prototype.derandomize = function() {
    clearInterval(this.timerFunction);
}

/********************
 * Helper Functions *
 ********************/
/* Utils object: Contains helper functions */
var utils = {
    setHash: function(path) {
        window.location.hash = path;
    },
    getHash: function() {
        return window.location.hash;
    }
};

/* Batch object: General batch animation functions */
var batch = {
    diceIntro: function(dice) {
        dice[0].element.animDiceIntro(0);
        dice[1].element.animDiceIntro(150);
        dice[2].element.animDiceIntro(300, function() {
            $('#index-main').animIndexIntro(function() {
                for(var i = 0; i < dice.length; i++) {
                    dice[i].showDots.call(dice[i]);
                }
            });
        });
    },
    randomizeDice: function(dice) {
        for(var i = 0; i < dice.length; i++) {
            dice[i].randomize.call(dice[i]);
        }
    }
};

/*********************
 * Startup Functions *
 *********************/
/* Initialize the socket variable in a global function */
var socket = io();

/* Startup animations? */
$(document).ready(function() {
    if(!utils.getHash()) {
        var dice = [new Die('#index-dice-group-hero'), new Die('#index-dice-group-hero'), new Die('#index-dice-group-hero')];
        batch.diceIntro(dice);
        batch.randomizeDice(dice);
    } else {
        alert("GAME exists!");
    }
});
