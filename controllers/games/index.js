var express = require("express"),
router = express.Router(),
path = require('path'),
make = require('../../lib/idGenerator');

var play = require("../../models/games");

var Words = require("../../models/words");
// Build routes For Game Actions
// Start By sending a validated board
// The game admin

// Fake DB For Development
var games = {};

router.post('/create', function(req, res){
    var nickname = req.body.nickname || "Guest" + make.key(),
    gameID = make.key(),
    admin = {'playerID': make.key(),'nickname': nickname, 'game': gameID};
    // admin is going to be a player object

    res.redirect('/games/create/' + gameID + '/' + nickname + '/' + admin.playerID);
    
    var grid = new play.board();
    grid.populate();
    games[gameID] = new play.game(admin, grid);
    games[gameID].gameKey = gameID;

    var letters = Object.keys(grid.letterIndex);
    Words.startsWith(letters, function(err, docs){
        console.log(games[gameID].validateBoard(docs));
    });
});

router.get('/create/:game/:nickname/:player', function(req, res){
    var game = req.params.game;
    var nickname = req.params.nickname;
    var player = req.params.player;
    res.json({'player': player, 'nickname': nickname, 'game': game});
});

router.post('/join', function(req, res){
    var gameID = req.body.gameID;
    var nickname = req.body.nickname || "Guest" + make.key();

    if (games[gameID].joinGame(nickname)){
        // res.redirect('/games/join/' + nickname + '/' + player);
        res.json({'registered': true,'playerID': make.key(),'nickname': nickname});
    }
    res.json({'registered': false});
});

// router.get('/join', function(req, res){

// });

// Temporary Url
router.post('/start', function(req, res){
    // Some Of this stuff must be middleware
    var gameID = req.body.gameID;
    var playerID = req.body.playerID;
    if (games[gameID].admin.playerID != playerID){
        res.json({success: false, message: "Waiting", grid: null});
    }
    // needs a game key or id and admin confirmation
    // Changes the Games Status Should Then redirect to /info
    games[gameID].gameStatus = "In Play";
    // I think this is the Success response
    res.json({success: true, message: "In Play", grid: games[gameID].board.letters});
});

// Temporary Url
router.get('/info', function(req, res){
    var gameID = req.body.gameID;
    var playerID = req.body.playerID;
    // turnSeq is the perfect example had i maintained the old unshit and push 
    // turnSeq would have been simple
    // {
    //     gameStatus:games[gameID].gameStatus,
    //     currentPlayer: games[gameID].players[games[gameID].currentTurn],
    //     turnSeq: (games[gameID].players.slice(games[gameID].currentTurn) + games[gameID].players.slice(0,games[gameID].currentTurn)).join(","),
    //     wordsDone:games[gameID].board.foundWords,
    //     scores:hash of nicknames and scores, 
    //     grid: games[gameID].board.letters
    // }
    // needs game key 
    // Info will show all the current state of the game
    // Socket will have an emit('game state changed') which
    // will prompt all sockets to call this route
});

// User Guess 
// If It is valid it does update the Game so post
router.post('/play', function(req, res){
    // needs a game key or id and turn confirmation
});

router.get('/board', function(req, res){
    res.sendFile(path.join(__dirname ,'../../public/','board.html'));
});

module.exports = router;