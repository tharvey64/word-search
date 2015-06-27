var express = require("express"),
router = express.Router(),
path = require('path');

var Boards = require("../../models/boards");

// Build routes For Game Actions
// Start By sending a validated board
// The game admin

router.get('/board', function(req, res){
    res.sendFile(path.join(__dirname ,'../../public/','board.html'));
});

router.get('/letters', function(req, res){
    Boards.createBoard(function(letters){
        res.send({'board': letters});
    });
});

// NOT ACTIVE
// router.get("/load/:game_id", function(req, res){
//     var gameId = req.params.game_id
//     res.send({'route':'/load'});
//     // Boards.loadGame(function(err, docs){
//     //     res.render("boards", {boards: docs});
//     // });
// });

// router.get("/create", function(req, res){
//     res.send({'route':'/create'});
//     // Boards.createGame(function(err, docs){
//     //     res.render("boards", {boards: docs});
//     // });
// });

module.exports = router;