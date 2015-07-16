var express = require("express"),
router = express.Router();

var Words = require("../../models/words");

router.get("/all", function(req, res){
    Words.all(function(err, docs){
        res.json({words: docs});
    });
});

router.get("/startsWith/:letters", function(req, res){
    var letters = req.params.letters;
    Words.startsWith(letters, function(err, docs){
        res.json({words: docs});
    });
});

module.exports = router;