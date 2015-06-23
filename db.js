var mongo = require('mongodb').MongoClient,
db, 
connected = false;

exports.connect = function(url, callback) {
    if (connected) return callback(db);

    mongo.connect(url, function(err, _db){
        if (err){
            throw new Error('Could not connect: '+err)
        }
        db = _db;
        connected = true;
        callback(db);
    });
}

exports.collection = function(name) {
    if (!connected){
        throw new Error('Must connect to Mongo before calling "collection".')
    }
    return db.collection(name);
}