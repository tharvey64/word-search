var express = require("express"),
router = express.Router();

var Words = require("../models/words");

router.get("/all", function(req, res){
    Words.all(function(err, docs){
        res.render("words", {words: docs});
    });
});

router.get("/recent", function(req, res){
    Words.recent(function(err, docs){
        res.render("words", {words: docs});
    });
});

module.exports = router;