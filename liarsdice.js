/* Global variables and requires */
var express = require('express');
var nunjucks = require('nunjucks');
var app = express();

/* Local static files */
app.use(express.static('static'));

/* Configure Nunjucks */
nunjucks.configure('views', {
	autoescape: true,
	watch: true,
	express: app
});

/* Start server with the process defined port (or 3000) */
var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
	console.log("[Web Server] Website is up and running!");
});

/* Initialize all views */
var views = require(__dirname + '/views.js')(app);

/* Initialize socket */
var socket = require(__dirname + '/socket.js')(server);
