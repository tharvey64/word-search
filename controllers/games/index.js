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
    // Put the gameID,nickname,and player key in the res body
    res.redirect('/games/create/' + gameID + '/' + nickname + '/' + admin.key);
    // create game
    // ------------------------------------------------ 
    games[gameID] = new gameModels.game(admin, new gameModels.board());
    //Test Validation Speed 
    // testSearch.repeat(games[gameID],gameModels.search);

    (function repeater(game){
        Words.startsWith(game.setup(), function(err, docs){
            if (!games[gameID].validateBoard(gameModels.search, docs)) repeater(game.setup());
        });
    })(games[gameID]);
});

router.get('/create/:game/:nickname/:player', function(req, res){
    // Redirect To Waiting Lobby
    var game = req.params.game;
    var nickname = req.params.nickname;
    var player = req.params.player;
    // send html back 
    res.json({'playerID': player, 'nickname': nickname, 'gameID': game.gameKey});
});

router.post('/join', function(req, res){
    var gameID = req.body.gameID;
    var nickname = req.body.nickname || "Guest" + make.key();
    var newPlayer = new gameModels.Player(nickname, make.key());

    if (!games[gameID]){
        res.status(404).send({'error':"Game Not Found."});
        return false;
    }

    games[gameID].joinGame(newPlayer);
    res.redirect('/games/join/' + gameID + '/' + newPlayer.key + '/' + nickname);
});

router.get('/join/:game/:player/:nickname', function(req, res){
    var game = req.params.game;
    var player = new gameModels.Player(req.params.nickname, req.params.player);
    if (game.isPlayer(player)){
        res.json({'registered': true,'playerID': player.key,'nickname': player.nickname});
        // Redirect To Waiting Lobby
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
        res.status(404).send({'error':"Game Not Found."});
        return false;
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
        res.json({'success': true, 'message': "In Play", 'grid': game.board.letters});
    }
    else{
        res.json({'success': false, 'message': "Waiting", 'grid': null});
    }
    console.log(game.board.answers);
});

// Temporary Url
router.get('/info/:game', function(req, res){
    var game = req.params.game;
    var player = new gameModels.Player(req.query.nickname,req.query.player);
    if (!game.isPlayer(player)){
        res.status(404).send({'error':"Invalid Player."});
        return false;
    }
    // This Is Everything In the Specs 
    res.json({
        'gameStatus':game.gameStatus,
        'currentPlayer': game.players[game.currentTurn].nickname,
        'turnSeq': game.turnSequence(),
        'wordsDone':game.foundWords,
        'scores': game.scores(),
        'grid': game.board.letters
    });
});

router.post('/play', function(req, res){
    var playerID = req.body.playerID,
    gameID = req.body.gameID,
    coordinates = req.body.word,
    letters = req.body.guess;
    var turn = games[gameID].currentTurn;
    if (!games[gameID]){
        res.status(404).send({'error':"Game Not Found."});
        return false;
    }
    else if (games[gameID].gameStatus == "Complete"){
        res.json({'success': false,'score': 0, 'message': 'The Game Is Over.'});
    }
    else if (games[gameID].players[turn].key != playerID){
        res.redirect('/games/play/-1');
    }
    else if (letters.length == 0){
        games[gameID].pass();
        res.redirect('/games/play/0');
    }
    else{
        var guess = {'word':letters,'coordinates': coordinates.split(";")}
        if (!games[gameID].checkGuess(playerID,guess)){
            res.redirect('/games/play/0');
        }
        else{
            res.redirect('/games/play/' + (letters.length).toString());
        }
    }
});

router.get('/play/:score', function(req, res){
    var score = req.params.score;
    if (Number(score) != -1){
        res.json({'success': true,'score': Number(score)});
    }
    else{
        res.json({'success': false,'score': 0, 'message': 'It is not your turn'});
    }
    // this needs success and score
});

router.get('/board', function(req, res){
    res.sendFile(path.join(__dirname ,'../../public/','board.html'));
});

module.exports = router;