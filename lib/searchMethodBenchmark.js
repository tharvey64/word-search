var Words = require("../models/words");
exports.repeat = function repeater(game, search){ 

    var callDB = (new Date()).getTime();

    Words.startsWith(game.setup(), function(err, docs){
        var searchStart = (new Date()).getTime();
        if (!game.validateBoard(search, docs)){ 
            repeater(game.setup());
        }
        var stopSearch = (new Date()).getTime();
        console.log("Search Time: " + (stopSearch-searchStart));
        console.log("DB Query Time: " + (searchStart-callDB));
        console.log("Success---------" + (new Date()).getTime());
        console.log("Total Time-------" + (stopSearch-callDB));
        console.log("Letters----------");
        console.log(game.board.answers);
    });
};
// Search Time Between 600 and 1200
// Try indexing Words and query for words whose letters are on the board