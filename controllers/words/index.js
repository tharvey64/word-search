var express = require("express"),
router = express.Router();

var Words = require("../../models/words");
// If the board has all the letters of the 
// alphabet get all the words
router.get("/all", function(req, res){
    Words.all(function(err, docs){
        res.render("words", {words: docs});
    });
});

// If the Board does not contain the full alphabet
// create the list with this route
router.get("/startsWith/:letter", function(req, res){
    Words.startsWith(function(err, docs){
        res.render("words", {words: docs});
    });
});

module.exports = router;