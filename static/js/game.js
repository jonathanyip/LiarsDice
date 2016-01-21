$(document).ready(function() {
	var socket = io();

	/* Handle messages from the server */
	socket.on('GameManager', function(msg) {
		switch(msg.info) {
			/* TODO */
		}
	});
});
