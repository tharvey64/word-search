var express = require("express"),
router = express.Router();

var Users = require("../models/users");

router.get("/login", function(req, res){
    Users.login(function(err, docs){
        res.render("users", {users: docs});
    });
});

router.get("/register", function(req, res){
    Users.register(function(err, docs){
        res.render("users", {users: docs});
    });
});

router.get("/logout", function(req, res){
    Users.logout(function(err, docs){
        res.render("users", {users: docs});
    });
});

module.exports = router;