var express = require("express"),
router = express.Router(),
path = require('path'),
make = require('../../lib/idGenerator');

var testSearch = require('../../lib/searchMethodBenchmark');

var gameModels = require("../../models/games");

var Words = require("../../models/words");

// ----------------------------------------
// Need to Either call it gameKey or gameID
// ----------------------------------------

// Fake DB For Development
var games = {};


router.param('game', function(req,res,next,id){
    // This Is Where you would hit the DB To Locate The Game
    if (!games[id]){
        res.status(404).send({error:"Game Not Found."});
        return;
    }
    else{
        req.params.game = games[id];
        next();
    }
});
// This stuff Might be done in order of occurrence in the url
// router.param('player', function(req,res,next,id){
//     // This Is Where you would hit the DB To Locate The Game
//     if (!req.params.game){
//         res.status(404).send({error:"Game Not Found."});
//         return;
//     }
//     else{
//         // needs player obj
//         if (req.params.game.isPlayer(player)) req.params.player ...;
//         next();
//     }
// });

router.post('/create', function(req, res){
    // Authentication Middleware Here
    var nickname = req.body.nickname || "Guest" + make.key();
    var admin = new gameModels.Player(nickname, make.key());

    var gameID = make.key();
    admin.gameKey = gameID;
    res.redirect('/games/create/' + gameID + '/' + nickname + '/' + admin.key);
    // create game
    // ------------------------------------------------ 
    games[gameID] = new gameModels.game(admin, new gameModels.board());
    //Test Validation Speed 
    testSearch.repeat(games[gameID],gameModels.search);
    
    // (function repeater(game){
    //     Words.startsWith(game.setup(), function(err, docs){
    //         if (!games[gameID].validateBoard(gameModels.search, docs)) repeater(game.setup());
    //     });
    // })(games[gameID]);
});

// Not Sure If This Will be The Set Up
router.get('/create/:game/:nickname/:player', function(req, res){
    var game = req.params.game;
    var nickname = req.params.nickname;
    var player = req.params.player;
    res.json({'player': player, 'nickname': nickname, 'game': game.gameKey});
});

router.post('/join', function(req, res){
    var gameID = req.body.gameID;
    var nickname = req.body.nickname || "Guest" + make.key();
    var newPlayer = new gameModels.Player(nickname, make.key());

    if (!games[gameID]){
        res.status(404).send({error:"Game Not Found."});
        return;
    }

    games[gameID].joinGame(newPlayer);
    res.redirect('/games/join/' + gameID + '/' + newPlayer.key + '/' + nickname);
});

router.get('/join/:game/:player/:nickname', function(req, res){
    var game = req.params.game;
    var player = gameModels.Player(req.params.nickname, req.params.player);

    if (game.isPlayer(player)){
        res.json({'registered': true,'playerID': player.key,'nickname': player.nickname});
    }
    else{
        res.json({'registered': false});
    }
});


router.post('/start', function(req, res){
    // Some Of this stuff must be middleware
    var gameID = req.body.gameID;
    var playerID = req.body.playerID;

    // ----------------------------------------
    // This Should be middleware use app.use
    if (!games[gameID]){
        res.status(404).send({error:"Game Not Found."});
        return;
    }
    // ---------------------------------------- 
    if (games[gameID].admin.key == playerID){
        games[gameID].gameStatus = "In Play";
        games[gameID].currentTurn = (Math.random()*games[gameID].players.length)|0;
    }
    // ^^^^^^This Should be a WordSearch prototype^^^^^^
    res.redirect('/games/start/' + gameID);
});

router.get('/start/:game', function(req, res){
    var game = req.params.game;
    if (game.gameStatus == "In Play"){
        res.json({success: true, message: "In Play", grid: game.board.letters});
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