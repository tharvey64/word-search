// var db = require("../db");
var mongo = require('mongodb'), 
monk = require('monk'),
db = monk('localhost:27017/gameServer'), 
words = db.get('words');

exports.all = function(query,cb){
    words.find(query, function(err,docs){
        cb(err, docs);
    });
}

// exports.recent = function(cb){
//     var collection = db.get().collection("words");
//     collection.find().sort({"date": -1}).limit(100).toArray(function(err, docs){
//         cb(err, docs);
//     });
// }