var express = require("express"),
router = express.Router(),
path = require('path'),
make = require('../../lib/idGenerator');

var gameModels = require("../../models/games");

var Words = require("../../models/words");
// Build routes For Game Actions
// Start By sending a validated board
// The game admin

// Fake DB For Development
// ----------------------------------------
// Need to Either call it gameKey or gameID
// ----------------------------------------
var games = {};

router.post('/create', function(req, res){
    var nickname = req.body.nickname || "Guest" + make.key(),
    gameID = make.key(),
    admin = new gameModels.Player(nickname,make.key());

    admin.gameKey = gameID;

    res.redirect('/games/create/' + gameID + '/' + nickname + '/' + admin.key);
    
    var grid = new gameModels.board();
    grid.populate();

    games[gameID] = new gameModels.game(admin, grid, gameID);

    var letters = Object.keys(grid.letterIndex);
    Words.startsWith(letters, function(err, docs){
        console.log(games[gameID].validateBoard(docs));
    });
});

// Not Sure If This Will be The Set Up
router.get('/create/:game/:nickname/:player', function(req, res){
    var gameID = req.params.game;
    var nickname = req.params.nickname;
    var player = req.params.player;
    res.json({'player': player, 'nickname': nickname, 'game': gameID});
});

router.post('/join', function(req, res){
    var gameID = req.body.gameID;
    var nickname = req.body.nickname || "Guest" + make.key();
    var newPlayer = new gameModels.Player(nickname, make.key());

    games[gameID].joinGame(newPlayer);
    res.redirect('/games/join/' + gameID + '/' + newPlayer.key);
});

router.get('/join/:game/:player', function(req, res){
    // There Needs To be middleware to confirms valid game
    // The Db will probably do that
    var gameID = req.params.game;
    var playerKey = req.params.player;
    var count = games[gameID].players.length;
    var joined = false;
    
    for (var i = 0; i < count; i++){
        if (playerKey == games[gameID].players[i].key){
            res.json({'registered': true,'playerID': playerKey,'nickname': games[gameID].players[i].nickname});
            joined = true;
            break;
        }
    }
    if (!joined){
        res.json({'registered': false});
    }
});


router.post('/start', function(req, res){
    // Some Of this stuff must be middleware
    var gameID = req.body.gameID;
    var playerID = req.body.playerID;

    if (games[gameID].admin.key == playerID){
        games[gameID].gameStatus = "In Play";
    }
    res.redirect('/games/start/' + gameID);
});

router.get('/start/:game', function(req, res){
    var gameID = req.params.game;
    if (games[gameID].gameStatus == "In Play"){
        res.json({success: true, message: "In Play", grid: games[gameID].board.letters});
    }
    else{
        res.json({success: false, message: "Waiting", grid: null});
    }
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
    // the request body will have the guess, gameKey, playerKey
    // needs a game key or id and turn confirmation
});

router.get('/play', function(req, res){
    // this needs success and score(round? or overall?)
    // needs a game key or id and turn confirmation
});

router.get('/board', function(req, res){
    res.sendFile(path.join(__dirname ,'../../public/','board.html'));
});

module.exports = router;