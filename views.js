/* Do the views */
module.exports = function(app) {
	/* Index view */
	app.get('/', function(req, res) {
		res.render('index');
	});
};
