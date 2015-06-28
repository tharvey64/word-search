var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http);
require('./user_socket').live(io);
// everything from http and io can go into ./user_socket
// and app can be the parameter

// ---------------
// Practice With req.body
var bodyParser = require('body-parser');
var multer = require('multer'); 

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

// Connecting to mongoDB
require("./db").connect('mongodb://localhost:27017/gameServer', function(){
    // I should probably open and close this as needed
    console.log("Mongo Connected.");
});

app.use(express.static(__dirname + '/public'));

var gameRouter = require('./controllers/games/index');
app.use('/games', gameRouter);

// Might not need this route
// Could just access model in /games route
var wordRouter = require('./controllers/words/index');
app.use('/words', wordRouter);
// var mainRouter = require('./controllers/main/index');
// app.use(mainRouter);

http.listen(3000, function(){
		console.log('listening on *:3000');
});
