/* Global variables and requires */
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

/* Initialize all views */
var views = require(__dirname + '/views.js')(app);

/* Start server with the process defined port (or 3000) */
var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log("Server is currently working!");
});

/* Initialize socket */
var socket = require(__dirname + '/socket.js')(server);
