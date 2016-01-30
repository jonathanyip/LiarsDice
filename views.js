/* Do the views */
module.exports = function(app) {
	/* Index view */
	app.get('/', function(req, res) {
		res.render('index');
	});
	/* Game view */
	app.get('/:id', function(req, res, next) {
		res.render('game', { 'GameID': req.params.id });
	});
};
