var express = require("express"),
router = express.Router();

var Boards = require("../models/boards");

router.get("/login", function(req, res){
    Boards.login(function(err, docs){
        res.render("boards", {boards: docs});
    });
});

router.get("/register", function(req, res){
    Boards.register(function(err, docs){
        res.render("boards", {boards: docs});
    });
});

router.get("/logout", function(req, res){
    Boards.logout(function(err, docs){
        res.render("boards", {boards: docs});
    });
});

module.exports = router;