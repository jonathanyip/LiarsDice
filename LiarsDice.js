/* Global variables */
var express = require('express');
var swig = require('swig');
var app = express();

/* Configure Swig template engine */
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);

/* Local static files */
app.use(express.static('static'));

app.get('/', function(req, res) {
	res.render('index');
});

var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log("Server is currently working.");
});