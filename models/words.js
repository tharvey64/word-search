var db = require("../db");

exports.all = function(cb){
    var collection = db.collection("words");
    collection.find().toArray(function(err,docs){
        cb(err, docs);
    });
}

exports.startsWith = function(cb){
    var collection = db.get().collection("words");
    collection.find().sort({"date": -1}).limit(100).toArray(function(err, docs){
        cb(err, docs);
    });
}