// exports.createGame = function(callback){

// }

// Games need players and current turn
// Create Game Class
// Game rules go in the Game class
// Game holds its unique game id

// i might have to index each word
function Game(){
    this.gameKey;
    this.players = [];
    this.validGame = false;
    // Might change this to the Board Object
    this.letters;
    this.foundWords = [];
    this.consecutivePasses = 0;
    // If I can store functions in the db then I will do that
    // Instead of Saving the Board Object to the game
    this.checkGuess;
}
Game.prototype.validateBoard = function(board, wordList){
    // returns True or False
    var validate = new Search(boardPrep);
    var limit = wordList.length;

    for (var i=0;i < limit; i++){
        validate.checkFirstLetterOf(wordList[i]);
    }
    // -----------------------------------------
    // To reduce risk of Boards with low word counts find optimum word set
    // This will increase the chances of Boards with more than 10 words
    // -----------------------------------------
    if (board.answers.length < 10){
        return false;
    }

    this.letters = board.letters;

    // Storing this in the db might not save the values of board
    // This is Reliant on this functions scope 
    // If i can store the function but not the scope of the function 
    // The function will have to change

    this.checkGuess = function(guess){
        // guess = {'word': guess word string,'coordinates':guess coordinates array}
        if (guess['cooordinates'].length != guess['word'].length) return false;

        var numberOfAnswers = board.answers.length;
        var guessLength = guess['cooordinates'].length;

        for(var index = 0; index < numberOfAnswers; index++){
            if (guessLength != board.answers[i]['cooordinates'].length) continue;
            var answer = board.answers[i]['cooordinates'];
            for(var j = 0; j < guessLength; j++){
                if (!(~answer.indexOf(guess['cooordinates'][i]))) break;

                if (j + 1 == guessLength){
                    this.foundWords.push(board.answers[i]);
                    return true;
                }
            } 
        }
        return false;
    }
    
    this.validGame = true;
    return true;
    // checking guesses may be easier than I first thought
    // using indexof
    // SETS this.checkGuess
    // This is unique to the version of the game
    // The Allowed Directions for Words should be imposed within 
    // the Search object
    // -----------------------------------------
}
// -----------------------------------------
// Player Management Prototypes
// ---Player Guesses
// ---Player Passes
// ---Player Quits
// ---Player Joins******Pre-Start
// -----------------------------------------
// Possibly Make A prototype for Game Start
// -At Game start this would preform all of the setup

// Game Start Prototype
// ---Randomize Player Order * Optional
// ---Create And Validate Game Board ** This Would be a Single method Call
// **-->^^This method would set the Value of the checkGuess Function
// **-->^^Also Sets the value of this.letters << this.letters is just the letters array
// -----------------------------------------
// Need A prototype to check end of game

// -----------------------------------------
// CHECK ANSWERS

// Easy way to check while telling Big O to Go fuck itself
// Use index of on each array in the answer list

// Checking against the answers is going to require Tinkering
// The Order of the letters input should not determine right or wrong
// The Coordinates should determine if an answer is write or wrong
// Caveate Paladrones are they worth double the points << If We are keeping score at all
// When checking answers filter out Answers that are not the same length as the users Guess
// -----------------------------------------
// This Method Might be Unnecssary if I Can Stroe The checkGuess Function
// 
// Prototype to send Object Literal to Client
// -The Object Will Contain
// --The Games Check answer function
// --The List of Words that have already been Found
// --The Board of Letters
// --**Possibly Additional Information**

function Board(){
    // Might Not Go in DB
    this.alphabet = ["A","A","A","B","B","C","C","D","D","E","E","E","E","F","F","G","G","H","H","I","I","I","I","J","J","K","K","L","L","M","M","N","N","O","O","O","O","P","P","Q","R","R","S","S","T","T","U","U","V","W","X","Y","Y","Z"];
    // DB Field
    this.answers = [];
    // DB Field
    this.letters;
    // Not DB Field 
    this.letterIndex;
}
Board.prototype.populate = function(characterSet){
    if (!characterSet){
        characterSet = this.alphabet;
    }
    this.letters = [];
    this.letterIndex = {};
    for (var i = 0; i < 15; i++){
        this.letters.push([]);
        for(var j = 0; j < 15; j++){
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
Search.prototype.checkFirstLetterOf = function(word){
    // Takes One word and checks to see if the board has
    // the first letter
    if (!this.board.letterIndex.hasOwnProperty(word[0])){
        return false;
    }
    var numberOfOccurrences = this.board.letterIndex[word[0]].length;
    for (var i = 0; i < numberOfOccurrences; i++){
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
        for(var index = 0; index < restOfWord+1; index++){
            checkRow = startObj['index'][0]+(row * index);
            checkColumn = startObj['index'][1]+(column * index);
            if(word[index] != this.board.letters[checkRow][checkColumn]['letter']){
                break;
            }else{
                answerCoordinates.push([checkRow,checkColumn].join(","));
            }
        }
        if(answerCoordinates.length == restOfWord+1){
            this.board.answers.push({'word':word, 'coordinates':answerCoordinates});
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
// Turn this into a createGame
exports.createBoard = function(cb){
    var currentBoard = new Board();
    currentBoard.populate();
    // Make entry in DB
    cb(currentBoard.letters);
}

var db = require("../db");

exports.getGame = function(cb){
    var collection = db.collection("games");
    collection.find().toArray(function(err,docs){
        cb(err, docs);
    });
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
            searchBoard.checkFirstLetterOf(line.toUpperCase());
        }
    }).then(function(){
        for (var i = 0; i < game.letters.length; i++){
            var row = [];
            for (var j = 0; j < game.letters[0].length; j++){
                row.push(game.letters[i][j]['letter']);
            }
            console.log(row.join("-"));
        }
        console.log(game.answers);
    });
}