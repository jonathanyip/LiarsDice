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
		socket.emit('GAME', { error: 'GAME_ALREADY_STARTED' });
		console.log("[Game]: Player {" + playerName + "} is a bit late to the party for Game {" + this.id + "}...");
		return;
	}

	// If this game already has a player with this name, don't let them join.
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].name === playerName) {
			socket.emit('GAME', { error: 'NAME_ALREADY_EXISTS' });
			console.log("[Game] Player name {" + playerName + "} already exists for Game {" + this.id + "}!");
			return;
		}
	}

	// Create a new player
	var player = new Player(playerName, socket.id);
	this.players.push(player);

	// Set user's socket variables, so they can use it later with (gameManager.getSocketGP())
	// The Game class should not interact with an individual player's socket anymore,
	// but rather through the Player class
	socket.game = this;
	socket.player = player;

	// Join this game room
	socket.join(this.id);

	// Tell all players that their player list needs to be updated
	this.sendToPlayer(io, player, { tag: 'JOINED_GAME' });
	this.sendToAll(io, { tag: 'UPDATE_PLAYERS', 'PLAYER_LIST': this.getPlayerNames() });

	console.log("[Game]: Player {" + playerName + "} joined Game {" + this.id + "}.");
}

/*
 * Removes the following player from the game
 * and brings everybody back to the lobby.
 */
Game.prototype.leaveGame = function(io, socket, player) {
	// Go to the lobby, if somebody left
	this.goToLobby(io);

	// Remove this player from our list
	var deletedPlayer = null;
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].id === player.id) {
			deletedPlayer = this.players[i];
			this.players.splice(i, 1);
			break;
		}
	}

	// Remove from socket.io room
	socket.leave(this.id);

	// Tell everybody to update
	this.sendToAll(io, { tag: 'UPDATE_PLAYERS', 'PLAYER_LIST': this.getPlayerNames() });

	console.log("[Game]: Player {" + deletedPlayer.name + "} left Game {" + this.id + "}.");
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

	this.sendToAll(io, { tag: 'STARTED_GAME' });

	console.log("[Game]: Started game {" + this.id + "}! Have fun!");

	// Start off with a round.
	this.doRound(io);
}

/* Do a round (new dice, reset bet, then do a turn)! */
Game.prototype.doRound = function(io) {
	// Reset current bet to null
	this.currentBet = null;

	// Randomize all dice
	this.randomizeDice();

	// Update total number of dice
	this.updateDiceTotal();

	// Update player status
	this.updatePlayerStatus();

	// Sends every player a pre-round update (how many dice they have, basically)
	for(var i = 0; i < this.players.length; i++) {
		this.sendToPlayer(io, this.players[i], {
			tag: 'PREROUND_UPDATE',
			'DICE_COUNT': this.players[i].dice.length,
		});
	}

	console.log("[Game]: Game {" + this.id + "} is playing a round. All players randomize!");

	setTimeout((function() {
		// Sends player all their dice info.
		for(var i = 0; i < this.players.length; i++) {
			this.sendToPlayer(io, this.players[i], {
				tag: 'ROUND_UPDATE',
				'DIE_LIST': this.players[i].dice,
				'DICE_TOTAL': this.diceTotal
			});
		}

		// Do a turn
		this.doTurn(io);
	}).bind(this), 5000);
}

/* Do a turn (no new dice, just switch players)! */
Game.prototype.doTurn = function(io) {
	// Get to the next player
	this.turn = this.getNextPlayer();

	// Send a game update to players
	this.sendToAllExcept(io, this.players[this.turn], {
		tag: 'TURN_UPDATE',
		'YOUR_TURN': false,
		'CURRENT_PLAYER': this.players[this.turn].name,
		'CURRENT_BET': this.currentBet
	});
	this.sendToPlayer(io, this.players[this.turn], {
		tag: 'TURN_UPDATE',
		'YOUR_TURN': true,
		'CURRENT_PLAYER': this.players[this.turn].name,
		'CURRENT_BET': this.currentBet
	});

	console.log("[Game]: Game {" + this.id + "} is playing a turn. It is {" + this.players[this.turn].name + "}'s turn.");
}

/* Does an action performed by a specific player */
Game.prototype.doAction = function(io, player, msg) {
	// Is it even their turn?
	if(player.id != this.players[this.turn].id) return;

	switch(msg['ACTION']) {
		case 'BET': {
			var numOfDice = msg['NUMBER'];
			var type = msg['TYPE'];

			if(this.currentBet !== null) {
				if(numOfDice < this.currentBet.number || (numOfDice == this.currentBet.number && type <= this.currentBet.type)) {
					this.sendToPlayer(io, player, { error: 'INVALID_BET' });

					console.log("[Game]: Player {" + player.name + "} tried to put an invalid bet!");
					return;
				}
			}

			this.currentBet = new Bet(player, numOfDice, type);
			this.doTurn(io);

			console.log("[Game]: Player {" + player.name + "} placed a bet!");
			break;
		}
		case 'SPOT_ON': {
			if(this.currentBet !== null) {
				var numOfDice = 0;
				for(var i = 0; i < this.players.length; i++) {
					numOfDice += this.players[i].countNumOfDie.call(this.players[i], this.currentBet.type);
				}

				if(numOfDice == this.currentBet.number) {
					// If the number of dice with this type equals the bet, everybody except them loses a die
					for(var i = 0; i < this.players.length; i++) {
						if(this.players[i].id != player.id) {
							this.players[i].removeDie.call(this.players[i]);
						}
					}

					this.sendToAll(io, { tag: 'FINAL_UPDATE', 'ACTION': 'SPOT_ON', 'SPOT_ON': true, 'PLAYER': player.name });
					console.log("[Game]: Player {" + player.name + "} said spot on! And they were right!");
				} else {
					// Remove a die from this player, cause they were wrong.
					player.removeDie.call(player);
					this.sendToAll(io, { tag: 'FINAL_UPDATE', 'ACTION': 'SPOT_ON', 'SPOT_ON': false, 'PLAYER': player.name });
					console.log("[Game]: Player {" + player.name + "} said spot on! But they were wrong...");
				}
			} else {
				this.sendToPlayer(io, player, { error: 'CANNOT_BET' });
				console.log("[Game]: Player {" + player.name + "} tried to say spot on, but there was no bet!");
			}
			break;
		}
		case 'BS': {
			var numOfDice = 0;
			for(var i = 0; i < this.players.length; i++) {
				numOfDice += this.players[i].countNumOfDie.call(this.players[i], this.currentBet['TYPE']);
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
	this.sendToAll(io, { tag: 'GO_TO_LOBBY' });
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

/* Updates player status (basically, are they still alive?) */
Game.prototype.updatePlayerStatus = function() {
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].dice.length == 0) {
			this.players[i].stillAlive = false;
		}
	}
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
	io.sockets.in(this.id).emit('GAME', msg);
}

/* Sends a message to all players except the specified player */
Game.prototype.sendToAllExcept = function(io, player, msg) {
	io.sockets.connected[player.id].broadcast.to(this.id).emit('GAME', msg);
}

/* Sends a message to this specific player */
Game.prototype.sendToPlayer = function(io, player, msg) {
	io.sockets.connected[player.id].emit('GAME', msg);
}

module.exports = Game;
