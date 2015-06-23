var db = require("../db");

exports.login = function(cb){
    var collection = db.collection("users");
    collection.find().toArray(function(err,docs){
        cb(err, docs);
    });
}

exports.register = function(cb){
    var collection = db.collection("users");
    collection.find().sort({"date": -1}).limit(100).toArray(function(err, docs){
        cb(err, docs);
    });
}

// exports.logout = function(cb){

// }