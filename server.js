var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http);
require('./user_socket').live(io);

var bodyParser = require('body-parser');
var multer = require('multer'); 
// app.set('view engine', 'jade')
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

require("./db").connect('mongodb://localhost:27017/gameServer', function(db){
    console.log("Mongo Connected.");
});

app.use(express.static(__dirname + '/public'));

var gameRouter = require('./controllers/games/index');
app.use('/games', gameRouter);

var wordRouter = require('./controllers/words/index');
app.use('/words', wordRouter);
var mainRouter = require('./controllers/main/index');
app.use(mainRouter);

http.listen(3000, function(){
		console.log('listening on *:3000');
});
