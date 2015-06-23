var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
socketManagement = require('user_sockets');

// Make this work
socketManagement.live(io);

app.use(express.static('public'));

http.listen(3000, function(){
		console.log('listening on *:3000');
});
