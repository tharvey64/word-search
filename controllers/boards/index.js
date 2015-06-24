var express = require("express"),
router = express.Router(),
path = require('path');

var Boards = require("../../models/boards");

// Need to think About these routes more
// These should be game centric routes not
// Board based routes
// Create the Game Class

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