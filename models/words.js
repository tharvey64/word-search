var db = require("../db");

exports.all = function(cb){
    var cursor = db.collection("words");
    cursor.find().toArray(function(err,docs){
        if(err){
            cb(err);
        }
        else{
            cb(null, docs);
        }
    });
}

exports.startsWith = function(letters,cb){
    var r = '^(' + letters.join('|') + ')';
    var cursor = db.collection("words");
    cursor.find({'word':{$regex: r, $options: 'i'}}).toArray(function(err,docs){
        if(err){
            cb(err);
        }
        else{
            cb(null, docs);
        }
    });
}