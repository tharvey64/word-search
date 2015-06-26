var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
socketManagement = require('./user_socket');

// Not Sure If I am supposed to do this Here
// But since it just Exports the Functions 
// The Connection Should remain unchanged
var db = require("./db");
db.connect('mongodb://localhost:27017/gameServer',function(){
    console.log("Mongo Connected.");
});
// Make this work
// Nice
socketManagement.live(io);

app.use(express.static(__dirname + '/public'));

var gameRouter = require('./controllers/boards/index');
app.use('/game', gameRouter);

var wordRouter = require('./controllers/words/index');
app.use('/words', wordRouter);
// var mainRouter = require('./controllers/main/index');
// app.use(mainRouter);

http.listen(3000, function(){
		console.log('listening on *:3000');
});
