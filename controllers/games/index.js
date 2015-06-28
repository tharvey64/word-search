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
// I NEED PLAYER OBJECTS WHAT A FUCKING OVERSIGHT
// Should be a post
router.post('/create', function(req, res){
    // Might Have to Use Objects For Players {'playerID':,'nickname':}
    var nickname = req.body.nickname || "Guest" + make.key();
    var gameID = make.key();
    var admin = {'playerID': make.key(),'nickname': nickname, 'game': gameID};
    var grid = new play.board();
    grid.populate();
    games[gameID] = new play.game(admin, grid);
    games[gameID].gameKey = gameID;
    // res.json({game: games[tag]});

    // // Validate grid down here
    // // **Try setImmediate << unless it is already asyncronous
    // var letters = Object.keys(grid.letterIndex);
    // Words.startsWith(letters, function(err, docs){
    //     console.log(games[tag].validateBoard(docs));
    // });
});

router.post('/join', function(req, res){
    var tag = req.body.gameID;
    var nickname = req.body.nickname || "Guest" + make.key();
    if games[tag].joinGame(nickname){
        // Shit Fuck
        // {'playerID': make.key(),'nickname': nickname, 'game': gameID};
    }
    res.json({game: games[tag]});
    // needs a game key or id
    // Changes the Games Player List Should Then redirect to /info
});

// Temporary Url
router.post('/start/', function(req, res){
    var tag = req.body.gameID;
    // needs a game key or id and admin confirmation
    // Changes the Games Status Should Then redirect to /info
    games[tag].gameStatus = "In Play";
    res.json({game: games[tag].board.answers});
});

// Temporary Url
router.get('/info/:gameID', function(req, res){
    var tag = req.params.gameID;
    res.json({game: games[tag]});
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

// NOT ACTIVE
// Complete Initial Implementation
// router.get("/load/:game_id", function(req, res){
//     var gameId = req.params.game_id
//     res.send({'route':'/load'});
//     // Boards.loadGame(function(err, docs){
//     //     res.render("boards", {boards: docs});
//     // });
// });

module.exports = router;