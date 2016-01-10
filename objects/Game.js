/* Objects */
var Player = require('./Player.js');
var Bet = require('./Bet.js');

/* Game Constructor */
var Game = function(gameID) {
	this.id = gameID;
	this.players = [];

	this.started = false;

	// Whose turn it is? Start with -1, so doTurn() increments it to 0 when we start.
	this.turn = -1;

	// The current on the table. If it is null, we need an initial bet, cause
	// we just started the game
	this.currentBet = null;
}

/**********************
 * Pre-Game Functions *
 **********************/
/* Creates a new player, and puts them in the game */
Game.prototype.joinGame = function(io, socket, playerName) {
	// If the game has already started, don't let more people join.
	if(this.started) {
		socket.emit('Game', { error: 'GameAlreadyStarted' });
		return;
	}

	// Create a new player
	var player = new Player(playerName, socket.id);
	this.players.push(player);

	// Set user's socket variables, so they can use it later (gameManager.getSocketGP())
	// The Game class should not interact with an individual player's socket anymore,
	// but rather through the Player class
	socket.game = this;
	socket.player = player;

	// Tell all other players that their player list needs to be updated
	this.sendToAll(io, { info: 'UpdatePlayers', 'PlayerList': this.getPlayerNames() });
}

/*
 * Removes the following player from the game
 * If they are the current player, move on to the next player.
 */
Game.prototype.leaveGame = function(io, player) {
	if(players[this.turn].id === player.id) {
		this.doTurn();
	}

	// Remove this player from our list
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].ID === player.ID) {
			this.players.splice(i, 1);
			break;
		}
	}

	// Remove from socket.io room
	io.sockets.connected[player.id].leave(this.id);

	// Tell other players that they need to update their list
	this.sendToAll(io, { info: 'UpdatePlayers', 'PlayerList': this.getPlayerNames() });
}

/* Returns a list of player names */
Game.prototype.getPlayerNames = function() {
	var names = [];
	for(var i = 0; i < this.players.length; i++) {
		names.push(this.players[i].name);
	}
	return names;
}

/******************
 * Game Functions *
 ******************/
/* Starts the game by preparing some initial values, then calling doTurn() */
Game.prototype.startGame = function(io) {
	this.started = true;
	this.turn = -1;
	this.currentBet = null;

	this.doRound(io);
}

/* Do a round (new dice and switch players)! */
Game.prototype.doRound = function(io) {
	this.loading(io);
	this.doTurn();

	// Randomize all dice
	for(var i = 0; i < this.players.length; i++) {
		this.players[i].randomizeDice.call(this.players[i]);
	}

	// Update player stats
	this.updatePlayerStats(io);
}

/* Do a turn (no new dice, just switch players)! */
Game.prototype.doTurn = function(io) {
	// Get to the next player
	this.turn = this.getNextPlayer();

	// Send info to players
	var gameStats = this.getGameStats();
	this.sendToAllExcept(io, this.players[this.turn], { info: 'WaitTurn', 'GameStats': gameStats });
	this.sendToPlayer(io, this.players[this.turn], { info: 'YourTurn', 'GameStats': gameStats });
}

/* Get game statistics */
Game.prototype.getGameStats = function() {
	var diceTotal = 0;
	for(var i = 0; i < this.players.length; i++) {
		diceTotal += this.players[i].dice.length;
	}

	return { 'DiceTotal': diceTotal, 'CurrentPlayer': this.players[this.turn].name, 'CurrentBet': this.currentBet };
}

/* Send the current information to the players */
Game.prototype.updatePlayerStats = function(io) {
	for(var i = 0; i < this.players.length; i++) {
		this.sendToPlayer(io, this.players[i], { info: 'UpdatePlayerStats', 'DieList': this.players[i].dice });
	}
}

/* Does an action performed by a specific player */
Game.prototype.doAction = function(io) {
	/*
	 * TODO: Recieve an action from the player,
	 * 1) If they bet:
	 *    - Update the bet.
	 *    - Directly go to doTurn()
	 * 2) If they say spot on:
	 *    - Check whether they were right (# of dice on table == bet)
	 *    - If they were right:
	 *         * Remove 1 die from everybody except the current player
	 *    - If they were wrong:
	 *         * Remove 1 die from the current player
	 *    - Tell everybody what happened
	 * 3) If they say BS:
	 *    - Check whether they were right (# of dice on table < bet)
	 *    - If they were right:
	 *         * Remove 1 die from the previous player (use this.getPrevPlayer())
	 *    - If they were wrong:
	 *         * Remove 1 die from the current player
	 *    - Tell everybody what happened
	 *
	 * For Spot On and Bet, wait until one player confirms to start doRound()
	 */
}

/* Tells the players to display a loading notification. */
Game.prototype.loading = function(io) {
	this.sendToAll(io, { info: 'Loading' });
}

/* Returns to the lobby, so new players can join */
Game.prototype.goToLobby = function(io) {
	this.started = false;
	this.sendToAll(io, { info: 'GoToLobby' });
}

/************************
 * Get Player Functions *
 ************************/
/* Get the next player that's still alive */
Game.prototype.getNextPlayer = function() {
	for(var i = (this.turn + 1) % this.players.length, start = this.turn; i != start; i = (i + 1) % this.players.length) {
		if(this.players[i].stillAlive) {
			return i;
		}
	}
	return this.turn;
}

/* Get the previous player that's still alive */
Game.prototype.getPrevPlayer = function() {
	for(var i = ((this.turn - 1) + this.players.length) % this.players.length, start = this.turn; i != start; i = ((i - 1) + this.players.length) % this.players.length) {
		if(this.players[i].stillAlive) {
			return i;
		}
	}
	return this.turn;
}

/***************************
 * Send Messages Functions *
 ***************************/
/* Sends a message to all players */
Game.prototype.sendToAll = function(io, msg) {
	io.sockets.in(this.id).emit('Game', msg);
}

/* Sends a message to all players except the specified */
Game.prototype.sendToAllExcept = function(io, player, msg) {
	io.sockets.connected[player.id].broadcast.to(this.id).emit('Game', msg);
}

/* Sends a message to this specific player */
Game.prototype.sendToPlayer = function(io, player, msg) {
	io.sockets.connected[player.id].emit('Game', msg);
}

module.exports = Game;
