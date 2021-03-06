var express = require("express"),
router = express.Router(),
path = require('path'),
make = require('../../lib/idGenerator');

var testSearch = require('../../lib/searchMethodBenchmark');

var gameModels = require("../../models/games");

var Words = require("../../models/words");

router.param('game', function(req,res,next,id){
    gameModels.gameFind(id,function(err,game){
        if (err){
            res.status(404).send({error:"Game Not Found."});
            return;
        }
        else{
            req.params.game = game;
            next();
        }
    });
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

    var currentGame = new gameModels.game(admin, new gameModels.board());
    //Test Validation Speed 
    // testSearch.repeat(games[gameID],gameModels.search);

    (function repeater(game){
        Words.startsWith(game.setup(), function(err, docs){
            if (!game.validateBoard(gameModels.search, docs)){
                repeater(game.setup());
            }else{
                gameModels.gameInsert(game, function(status){
                    // redirect moved to call back
                    res.redirect('/games/create/' + gameID + '/' + nickname + '/' + admin.key);
                });
            }
        });
    })(currentGame);
});

router.get('/create/:game/:nickname/:player', function(req, res){
    // Redirect To Waiting Lobby
    var game = req.params.game;
    var nickname = req.params.nickname;
    var player = req.params.player;
    // send html back 
    res.json({'playerID': player, 'nickname': nickname, 'gameID': game.gameKey});
});
// create instance of game
router.post('/join/:game', function(req, res){
    var game = req.params.game;
    var nickname = req.body.nickname || "Guest" + make.key();
    var newPlayer = new gameModels.Player(nickname, make.key());

    if(game.gameStatus == "Building" || game.gameStatus == "Waiting"){
        if (game.joinGame(newPlayer)){
            gameModels.gameUpdate(game,function(err,obj){
                res.redirect('/games/join/' + game.gameKey + '/' + newPlayer.key + '/' + nickname);
            });
        }
    }
    else{
        res.redirect('/games/join/' + game.gameKey + '/' + newPlayer.key + '/' + nickname);
    }
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


router.post('/start/:game', function(req, res){
    var game = req.params.game;
    var playerID = req.body.playerID;
    // There Should Be A Game Method That Verifies This
    if (game.admin.key == playerID){
        game.gameStatus = "In Play";
        game.currentTurn = (Math.random()*game.players.length)|0;
        gameModels.gameUpdate(game,function(err,obj){
                res.redirect('/games/start/' + game.gameKey);
        });
    }
    else{
        // ^^^^^^This Should be a WordSearch prototype^^^^^^
        res.redirect('/games/start/' + game.gameKey);
    }
});

router.get('/start/:game', function(req, res){
    var game = req.params.game;
    if (game.gameStatus == "In Play"){
        res.json({'success': true, 'message': "In Play", 'grid': game.board.letters});
    }
    else{
        res.json({'success': false, 'message': "Waiting", 'grid': null});
    }
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
// FIX
router.post('/play/:game', function(req, res){
    var playerID = req.body.playerID,
    game = req.params.game,
    coordinates = req.body.word,
    letters = req.body.guess;
    var turn = game.currentTurn;
    var score = "0";
    if (game.gameStatus == "Complete"){
        res.json({'success': false,'score': 0, 'message': 'The Game Is Over.'});
        return;
    }
    else if (game.players[turn].key != playerID){
        score = "-1";
    }
    else if (letters.length == 0){
        game.pass();
    }
    else{
        var guess = {'word':letters,'coordinates': coordinates.split(";")}
        if (!game.checkGuess(playerID,guess)){
            score = "0";
        }
        else{
            score = letters.length.toString();
        }
    }
    var url = '/games/play/'+score
    if (score === "-1"){
        res.redirect(url);
        return;
    }
    else{
        gameModels.gameUpdate(game,function(err,obj){
            // Do Something With the Error
            res.redirect(url);
            return;
        }); 
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
});

router.get('/board', function(req, res){
    res.sendFile(path.join(__dirname ,'../../public/','board.html'));
});

module.exports = router;