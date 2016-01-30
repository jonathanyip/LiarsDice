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
	// we just started the game or we did another round.
	this.currentBet = null;

	// Total number of dice in play
	this.diceTotal = 0;
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
/* Starts the game by preparing some initial values */
Game.prototype.startGame = function(io) {
	this.started = true;
	this.turn = -1;
	this.currentBet = null;

	// Reset all players, just in case we're playing again
	for(var i = 0; i < this.players.length; i++) {
		this.players[i].reset.call(this.players[i]);
	}

	// Start off with a round
	this.doRound(io);
}

/* Do a round (new dice, reset bet, then do a turn)! */
Game.prototype.doRound = function(io) {
	// Tell them to display a loading screen
	this.loading(io);

	// Reset current bet to null
	this.currentBet = null;

	// Randomize all dice
	this.randomizeDice();

	// Update total number of dice
	this.updateDiceTotal();

	// Sends every player a game update
	for(var i = 0; i < this.players.length; i++) {
		var gameStats = { 'DieList': this.players[i].dice, 'DiceTotal': this.diceTotal };
		this.sendToPlayer(io, this.players[i], {
			info: 'GameUpdate',
			'Type': 'Round',
			'GameStats': gameStats
		});
	}

	// Do a turn
	this.doTurn();
}

/* Do a turn (no new dice, just switch players)! */
Game.prototype.doTurn = function(io) {
	// Get to the next player
	this.turn = this.getNextPlayer();

	// Send a game update to players
	var gameStats = { 'CurrentPlayer': this.players[this.turn].name, 'CurrentBet': this.currentBet };
	this.sendToAllExcept(io, this.players[this.turn], {
		info: 'TurnUpdate',
		'Type': 'Turn',
		'YourTurn': false,
		'GameStats': gameStats
	});
	this.sendToPlayer(io, this.players[this.turn], {
		info: 'TurnUpdate',
		'Type': 'Turn',
		'YourTurn': true,
		'GameStats': gameStats
	});
}

/* Does an action performed by a specific player */
Game.prototype.doAction = function(io, player, actionMsg) {
	switch(actionMsg['Action']) {
		case 'Bet': {
			var numOfDice = actionMsg['NumOfDice'];
			var diceNum = actionMsg['DiceNum'];

			this.currentBet = new Bet(player, numOfDice, diceNum);
			this.doTurn();

			break;
		}
		case 'SpotOn': {
			var numOfDice = 0;
			for(var i = 0; i < this.players.length; i++) {
				numOfDice += this.players[i].countNumOfDie.call(this.players[i], this.currentBet.diceNum);
			}

			if(numOfDice == this.currentBet.numOfDice) {
				for(var i = 0; i < this.players.length; i++) {
					if(this.players[i].id != player.id) {
						this.players[i].removeDie.call(this.players[i]);
					}
				}

				this.sendToAll(io, { info: 'ResultsUpdate', 'SpotOn': true });
			} else {
				this.sendToAll(io, { info: 'ResultsUpdate', 'SpotOn': false });
			}

			break;
		}
		case 'BS': {
			var numOfDice = 0;
			for(var i = 0; i < this.players.length; i++) {
				numOfDice += this.players[i].countNumOfDie.call(this.players[i], this.currentBet.diceNum);
			}
			break;
		}
	}
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

/* Returns to the lobby, so new players can join */
Game.prototype.goToLobby = function(io) {
	this.started = false;
	this.sendToAll(io, { info: 'GoToLobby' });
}

/*********************
 * Helpful Functions *
 *********************/
/* Randomize all dice */
Game.prototype.randomizeDice = function() {
	for(var i = 0; i < this.players.length; i++) {
		this.players[i].randomizeDice.call(this.players[i]);
	}
}

/* Updates total number of dice in play */
Game.prototype.updateDiceTotal = function() {
	var diceTotal = 0;
	for(var i = 0; i < this.players.length; i++) {
		diceTotal += this.players[i].dice.length;
	}

	this.diceTotal = diceTotal;
}

/* Tells the players to display a loading notification. */
Game.prototype.loading = function(io) {
	this.sendToAll(io, { info: 'Loading' });
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
