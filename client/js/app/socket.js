// obsluga socketu

//if(typeof io !== 'undefined') {
    var socket = io.connect();
    var threedox = new Threedox(socket);
/*} else {
    console.log($('html').attr('data-brackets-id'));
    log('Not found socket.io.js! Wihtout this game won\'t run correcly! ', 'error');
}*/

// init
socket.on('init', function(data) {
    console.log(data.text);
    
});

function onFriendDisconnection(callback) {
    socket.on('friendDisconnected', function(data) {
        console.log(data);
        callback(data);
    });
}

// inicjuje nową grę
function newGameInit(callback) {
    socket.emit('newGame', {});

    socket.on('signState', function(data) {
        console.log(data);
        callback(data);
    });
}

// wysyla wybrany znak przez gracza na serwer
function makeChoice(sign) {
    if(sign === 'o' || sign === 'x')
        socket.emit('choose', { sign: sign })
    else
        console.log('makeChoice error: podano zly znak!');
}