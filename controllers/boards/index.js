var express = require("express"),
router = express.Router();

var Boards = require("../models/boards");

// Need to think About these routes more
// These should be game centric routes not
// Board based routes
// Create the Game Class

router.get('/board', function(req, res){
    res.sendFile(__dirname + '/board.html');
});

router.get('/letters', function(req, res){
    res.send({'board': letters});
});

router.get("/load/:game_id", function(req, res){
    Boards.loadGame(function(err, docs){
        res.render("boards", {boards: docs});
    });
});

router.get("/create", function(req, res){
    Boards.createGame(function(err, docs){
        res.render("boards", {boards: docs});
    });
});

module.exports = router;