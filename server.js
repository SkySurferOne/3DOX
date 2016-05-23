// requires
var http = require('http');
var socketio = require('socket.io');
var express = require('express');
var tools = require('./node_modules/threedox/tools');
var THREEDOX = require('./node_modules/threedox/THREEDOX.Classes');

//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

//
var manageRooms = new THREEDOX.ManageRooms();
var allUsers = {};
var userNumber = 1;

// route
router.use(express.static(__dirname + "/client"));

// on first client connection
io.sockets.on('connection', function(socket) {
    var kk = {
	   WYBRANO: 1,
	   NIE_WYBRANO: 0,
       WYBRALES: 2
    };
    
    //
    var myNumber = userNumber++;
    var myName = 'user' + myNumber;
    
    allUsers['id_'+socket.id] = socket;
    
    tools.showUserInfo(socket, 'User connected');
    
    // on NewGame
    socket.on('newGame', function(data) {
        //make new player
        var player = new THREEDOX.Player({
            id: socket.id,
            name: myName,
            host: socket.handshake.headers.host,
            socket: socket
        });
        manageRooms.giveMeRoom(player);
        console.log(manageRooms.rooms);
        
        var playerGame = manageRooms.getGameByPlayerId(player.id);
        var playerFactObj = manageRooms.getPlayerById(player.id);
        //sprawdzenie czy dla gry gracza o id jest wybrany znak
        var signChosen = playerGame.signChosen;
        if(signChosen) {
            playerFactObj.setSign(playerGame.signLeft);
            //signState
            signState(socket, kk.WYBRANO, playerGame.signLeft, 'newGameBox');
        } else {
            //signState
            signState(socket, kk.NIE_WYBRANO, null, 'newGameBox');
        }
        
    });
    
    // sends info about signState
    function signState(s, ok, takeSign, from, err) {
        var obj = {
            kk: ok,
            takeSign: takeSign,
            from: from,
            err: err
        };
         s.emit('signState', obj);
    }
    
    // init
    socket.emit('init', { text: "Witaj na serwerze 3DOX!" });
    
    // on choose
    socket.on('choose', function(data) {
        var playerGame = manageRooms.getGameByPlayerId(socket.id);
        var signChosen = playerGame.signChosen;
        
        //znak nie zostal jeszcze wybrany w tej grze
        if(!signChosen) {
            tools.showUserInfo(socket, 'This user choosed ' + data.sign);
            // set choose
            var bool = manageRooms.getPlayerById(socket.id).setSign(data.sign);
            if(bool) {
                if(playerGame.setSignChoice(data.sign)) {
                    signState(socket, kk.WYBRALES, data.sign, 'choiceBox');             
                    
                    var friend = manageRooms.getPartnerByPlayerId(socket.id); 
                    if(friend) {
                        friend.setSign(playerGame.signLeft);
                        signState(friend.socket, kk.WYBRANO, playerGame.signLeft, 'partnerChoiceBox');
                    }
                }
            } else {
                signState(socket, kk.WYBRALES, null, 'choiceBox', 'Coś poszlo nie tak przy ustawianiu znaku.');
            }
            
        } else {
            var signLeft = playerGame.signLeft;
            manageRooms.getPlayerById(socket.id).setSign(signLeft);
            signState(socket, kk.WYBRANO, signLeft, 'choiceBox');
        }
        
        
    });
    
    socket.on('getGamerSign', function() {
        var playerObj = manageRooms.getPlayerById(socket.id);
        var sign = (playerObj)? playerObj.sign : null;
        socket.emit('getGamerSign', { sign: sign });
    });
    
    socket.on('update', function(flag) {
       emitUpdated(socket, flag);
    });
    
    function emitUpdated(s, flag) {
        if(typeof flag === 'undefined') flag = '';
        
        var playerObj = manageRooms.getPlayerById(s.id);
        var friendObj = manageRooms.getPartnerByPlayerId(s.id);
        
        var sign = (playerObj)? playerObj.sign : null;
        var playerGame = manageRooms.getGameByPlayerId(s.id);
        
        if(flag === 'start') { 
            playerGame.gameStarted = true;
            emitUpdated(manageRooms.getPartnerByPlayerId(s.id).socket, '');
        }
        
        var gameStarted = (playerGame)? playerGame.gameStarted : false;
        var gamerNumber = (playerObj)? playerObj.number : null;
        var whoTurn = (playerGame)? playerGame.whoTurn : null;
        var field = (playerGame)? playerGame.field : null;
        var score = (playerGame)? playerGame.score : null;
        
        var friendName = (friendObj)? friendObj.name : 'not connected';
        var friendNum = (gamerNumber === 1)? 2 : 1;
        var playersNames = {};
        playersNames['player'+gamerNumber] = playerObj.name;
        playersNames['player'+friendNum] = friendName;
        
        var obj = {
            gamerSign: sign,
            gameStarted: gameStarted,
            gamerNumber: gamerNumber,
            whoTurn: whoTurn,
            field: field,
            score: score,
            playersNames: playersNames
        }
        s.emit('updated', obj);
    }
    
    socket.on('deletePlayers', function() {
        tools.showUserInfo(socket, 'User deleted from room');
        
        manageRooms.deletePlayer(socket.id);
        console.log(manageRooms.rooms);
        
    });
    
    socket.on('changeTurn', function() {
        manageRooms.getGameByPlayerId(socket.id).changeTurn();
        var friend = manageRooms.getPartnerByPlayerId(socket.id); 
        emitUpdated(friend.socket, '');
        emitUpdated(socket, '');
    });
    
    socket.on('fillFieldCell', function(data) {
        var game = manageRooms.getGameByPlayerId(socket.id);
        game.fillFieldCell(data.gamerSign, data.i, data.j, data.k);
        game.checkShots();
        //emitUpdated(socket, 'fillFieldCell');
        //emitUpdated(manageRooms.getPartnerByPlayerId(socket.id).socket, 'fillFieldCell');
    });
    
    // on user disconnect
    socket.on('disconnect', function(){
        tools.showUserInfo(socket, 'User disconnected');
        var friendObj = manageRooms.getPartnerByPlayerId(socket.id);
        if(friendObj) {
            manageRooms.deletePlayer(friendObj.socket.id);
            friendObj.socket.emit('friendDisconnected', 'You was deleted from the room because, your opponent has disconnected from the game. Sorry.');
        }
        
        manageRooms.deletePlayer(socket.id);
        console.log(manageRooms.rooms);
        
        allUsers['id_'+socket.id] = null;
    });
})

var localhost = '127.0.0.1';
var homeNet = '192.168.0.13';
// run server
server.listen(8081, localhost, function(){
    
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
    
});