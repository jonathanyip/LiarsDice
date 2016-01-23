/*
 * Globals.js:
 * Contains everything including utils, global variables, and startup things.
 */

/* Utils object: Contains helper functions */
var utils = {
    setHash: function(path) {
        window.location.hash = path;
    },
    getHash: function() {
        return window.location.hash;
    }
};

/* Die object: Has prototypes for the animation */
var Die = function(parent) {
    this.parent = $(parent);

    /* The constructor adds the die element for you */
    this.element = $('<div class="die"><div class="dot one"></div><div class="dot two"></div><div class="dot three"></div><div class="dot four"></div><div class="dot five"></div><div class="dot six"></div></div>').hide();
    this.parent.append(this.element);
}
/* Do dice intro */
Die.prototype.introShow = function(options, callback) {
    this.element.animDiceIntro(options, callback);
}
/* Randomize dice animation */
Die.prototype.randomize = function() {

}
/* Stops die randomization */
Die.prototype.derandomize = function() {

}

/* Initialize the socket variable in a global function */
var socket = io();

/* Startup animations? */
$(document).ready(function() {
    if(!utils.getHash()) {
        var dice = [new Die('#index-dice-group-hero'), new Die('#index-dice-group-hero'), new Die('#index-dice-group-hero')];
        anim.diceIntro(dice);
        anim.randomizeDice(dice);
    } else {
        alert("GAME exists!");
    }
});
