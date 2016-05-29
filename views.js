module.exports = function(app) {
	/* Index View */
	app.get('/', function(req, res) {
		res.render('index.html');
	});
	/* Game View */
	app.get('/:id', function(req, res, next) {
		res.render('game.html', { 'GameID': req.params.id });
	});
};
