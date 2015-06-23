var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http);
var test = require('./models/board.js');


var game = new test.Board();
game.populate();
var search = new test.Search(game);

app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/board', function(req, res){
	res.sendFile(__dirname + '/board.html');
});

app.get('/letters', function(req, res){
	var alpha = ["A","A","B","C","D","E","E","F","G","H","I","I","J","K","L","M","N","O","O","P","Q","R","S","T","U","U","V","W","X","Y","Z"];
	letters = [];
	for (i = 0; i < 15; i++){
		letters.push([]);
		for(j = 0; j < 15; j++){
			letters[i].push(alpha[Math.floor(Math.random()*alpha.length)])
		}
	}
	res.send({'board': letters});
});

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
