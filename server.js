var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
socketManagement = require('user_sockets');

// Delete most of this stuff

app.use(express.static('public'));

var connected = {};
var games = 0;

io.on('connection', function(socket){
	var name;
	socket.emit('sessionId', socket.id);

	socket.on('userName', function(userName){
		if (connected.hasOwnProperty(userName)){
			socket.emit('userName taken', userName);
		}
		else{
			name = userName;
			connected[userName] = socket.id;
			io.emit('sendUsers', Object.keys(connected));	
		}
	});

	socket.on('newGame',function(users, gameId){
		// This game desperatly needs a db
		for(i=0; i < users.length; i++){
			socket.broadcast.to(connected[users[i]]).emit('gameInvitation', gameId);
		}
	});

	socket.on('join game', function(gameId){
		socket.to(gameId).emit('chat message', name + " Joined Game");
	});

	socket.on('start game', function(board, gameId){
		io.to(gameId).emit('start game', board);
	});

	socket.on('chat message', function(msg){
		socket.broadcast.emit('chat message', msg);
	});
	
	socket.on('disconnect', function(){
		io.emit('chat message', name + " logged out.");
		delete connected[name];
		io.emit('sendUsers', Object.keys(connected));
	});
});

http.listen(3000, function(){
		console.log('listening on *:3000');
});
