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
    var letterRegex = "";
    var limit = letters.length;
    for(i=0; i<limit;i++){
        if (i + 1 == letters.length){
            letterRegex += letters[i];
        }
        else{
            letterRegex += letters[i] + "|";
        }
    }
    var r = '^(' + letterRegex + ')';
    // ------------------------------------------

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