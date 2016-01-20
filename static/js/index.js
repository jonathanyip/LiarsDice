$(document).ready(function() {
    var socket = io();

    /* Show Join Game Page */
    $('#index-play-game').click(function() {
        $('#index-page').velocity('transition.slideUpOut', {
            duration: 100,
            complete: function() {
                $('#join-page').velocity('transition.slideUpIn', { duration: 100 });
            }
        });
    });

    /* Checks whether this game exists */
    $('#join-find-game').click(function() {
        socket.emit('General', { info: 'DoesGameExist', 'GameID': $("#join-game-key").val() });
    });

    /* Handle messages from the server */
    /* From the GameManager */
    socket.on('GameManager', function(msg) {
        switch(msg.info) {
            case 'GameExists': {
                alert("Game Exists!");
                break;
            }
            case 'GameDoesNotExist': {
                if($('#join-error').css('display') === 'none') {
                    $('#join-error').velocity('slideDown', { duration: 250, queue: false })
                                    .velocity('transition.slideRightIn', { delay: 250, duration: 250 });
                } else {
                    $('#join-error').velocity('transition.slideRightIn', { delay: 250, duration: 250 });
                }
                break;
            }
        }
    });
});
