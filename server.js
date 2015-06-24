var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
socketManagement = require('user_sockets');

// Make this work
socketManagement.live(io);

app.use(express.static('public'));

var mainRouter = require('./controllers/main/index');
app.use(/\/$/, gameRouter);

var gameRouter = require('./controllers/boards/index');
app.use('/game', gameRouter);

http.listen(3000, function(){
		console.log('listening on *:3000');
});
