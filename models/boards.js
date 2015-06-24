var db = require("../db");

exports.getGame = function(cb){
    var collection = db.collection("games");
    collection.find().toArray(function(err,docs){
        cb(err, docs);
    });
}

// exports.createGame = function(callback){

// }

// Games need players and current turn
// Create Game Class
// Game rules go in the Game class
// Game holds its unique game id

function Board(){
    // Might Not Go in DB
    this.alphabet = ["A","A","A","B","B","C","C","D","D","E","E","E","E","F","F","G","G","H","H","I","I","I","I","J","J","K","K","L","L","M","M","N","N","O","O","O","O","P","P","Q","R","R","S","S","T","T","U","U","V","W","X","Y","Y","Z"];
    // DB Field
    // Change This to a Dictionary
    this.answers = [];
    // DB Field
    this.letters;
    // DB Field
    this.letterIndex = {};
}
Board.prototype.populate = function(characterSet){
    console.log(arguments.length);
    if (!characterSet){
        characterSet = this.alphabet;
    }
    this.letters = [];
    for (i = 0; i < 15; i++){
        this.letters.push([]);
        for(j = 0; j < 15; j++){
            var newLetter = characterSet[Math.floor(Math.random()*characterSet.length)];
            if (!this.letterIndex.hasOwnProperty(newLetter)){
                this.letterIndex[newLetter] = [];
            }
            this.letterIndex[newLetter].push([i,j]);
            this.letters[i].push({'letter': newLetter,'index': [i,j]});
        }
    }
}

function Search(board){
    this.board = board;
}
Search.prototype.checkFirstLetter = function(word){
    if (!this.board.letterIndex.hasOwnProperty(word[0])){
        return false;
    }
    for (i = 0; i < this.board.letterIndex[word[0]].length; i++){
        var currentLetter = this.board.letterIndex[word[0]][i];
        this.checkSurround(currentLetter, word);
    }
}
Search.prototype.checkSurround = function(cooordinate, word){
    var startObj = this.board.letters[cooordinate[0]][cooordinate[1]];
    var numberOfColumns = this.board.letters[0].length;
    var numberOfRows = this.board.letters.length;
    var restOfWord = word.length - 1;

    var findWord = function(row, column){
        var answerCoordinates = [];
        
        for(index = 0; index < word.length; index++){
            checkRow = startObj['index'][0]+(row * index);
            checkColumn = startObj['index'][1]+(column * index);
            if(word[index] != this.board.letters[checkRow][checkColumn]['letter']){
                break;
            }else{
                answerCoordinates.push([checkRow,checkColumn].join(","));
            }
        }
        if(answerCoordinates.length == word.length){
            this.board.answers.push(answerCoordinates.join(";"));
        }
    }

    if (startObj['index'][1]-restOfWord >= 0){
        findWord.call(this,0,-1)
    }
    if (startObj['index'][0]-restOfWord >= 0 && startObj['index'][1]-restOfWord >= 0){
        findWord.call(this,-1,-1)
    }
    if (startObj['index'][0]-restOfWord >= 0){
        findWord.call(this,-1,0);
    }
    if (startObj['index'][0]-restOfWord >= 0 && startObj['index'][1]+restOfWord < numberOfColumns){
        findWord.call(this,-1,1);
    }
    if (startObj['index'][1]+restOfWord < numberOfColumns){
        findWord.call(this,0,1);
    }
    if (startObj['index'][0]+restOfWord < numberOfRows && startObj['index'][1]+restOfWord < numberOfColumns){
        findWord.call(this,1,1);
    }
    if (startObj['index'][0]+restOfWord < numberOfRows){
        findWord.call(this,1,0);
    }
    if (startObj['index'][0]+restOfWord < numberOfRows && startObj['index'][1]-restOfWord >= 0){
        findWord.call(this,1,-1);
    }
}

// This should export a game not The Board or Search
// exports.board = Board;
// exports.search = Search;
var currentBoard;

exports.createBoard = function(cb){
    var currentBoard = new Board();
    currentBoard.populate();
    cb(currentBoard.letters);
}


if(!module.parent){
    // TESTS Should Replace This
    var game = new Board();
    console.log(game.alphabet);
    console.log(game.letters);
    console.log(game.letterIndex);
    console.log(game.answers);
    game.populate();
    console.log(game.letters);
    console.log(game.letterIndex);
    console.log(game.letters.length);
    console.log(game.letters[0].length);
    // Search Speed Needs to be increased
    var searchBoard = new Search(game);
    var lineReader = require('line-reader');

    lineReader.eachLine('dictionary.txt', function(line) {
        if (line.length > 3){
            searchBoard.checkFirstLetter(line.toUpperCase());
        }
    }).then(function(){
        for (i = 0; i < game.letters.length; i++){
            var row = [];
            for (j = 0; j < game.letters[0].length; j++){
                row.push(game.letters[i][j]['letter']);
            }
            console.log(row.join("-"));
        }
        console.log(game.answers);
    });
}