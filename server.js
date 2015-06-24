var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
socketManagement = require('./user_socket');

// Make this work
// Nice
socketManagement.live(io);

app.use(express.static(__dirname + '/public'));

var gameRouter = require('./controllers/boards/index');
app.use('/game', gameRouter);

// var mainRouter = require('./controllers/main/index');
// app.use(mainRouter);

http.listen(3000, function(){
		console.log('listening on *:3000');
});
