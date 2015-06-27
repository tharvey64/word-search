// Game rules go in the Game class
// If I pass the Search Obj into validateBoard 
// it would decouple the game from the search Obj
// Game holds its unique game id

// Players Should be unique usernames when i am done
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
    // Pass the Search Obj? Search Obj is Initialized by the Board
    // returns True or False
    var validate = new Search(board);
    var limit = wordList.length;

    for (var i=0;i < limit; i++){
        validate.checkFirstLetterOf(wordList[i]);
    }
    // -----------------------------------------
    // To reduce risk of Boards with low word counts find optimum word set.
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
        // if (this.consecutivePasses != 0) this.consecutivePasses = 0;
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
                    // This Ignores Palindrones
                    // How Would I Do That
                    // I could immediatly jump to other words
                    // In the list that are the same word
                    return true;
                }
            } 
        }
        return false;
    }
    
    this.validGame = true;
    // -----------------------------------------
    // For Development Only This Will Equal [] In Production
    this.foundWords = board.answers;
    // -----------------------------------------
    return true;
}
Game.prototype.endTurn = function(){
    // Find a Faster Way Like a Linked List With a Tail Pointer
    // Check If game is Over
    var last = this.players.shift();
    this.players.push(last);
}
Game.prototype.pass = function(){
    this.consecutivePasses += 1;
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
// ---validating board
// ---figuring out Who is in the game

// Game Start Prototype
// ---Randomize Player Order * Optional
// ---Create And Validate Game Board ** This Would be a Single method Call
// **-->^^This method would set the Value of the checkGuess Function
// **-->^^Also Sets the value of this.letters << this.letters is just the letters array
// -----------------------------------------
// Need A prototype to check end of game

// -----------------------------------------
// CHECK ANSWERS
// Paladrones are they worth double the points << If We are keeping score at all
// When checking answers filter out Answers that are not the same length as the users Guess
// -----------------------------------------
// I need a Prototype that updates game state

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
    var grid = this.board.letters;
    var startObj = grid[cooordinate[0]][cooordinate[1]];
    var numberOfColumns = grid[0].length;
    var numberOfRows = grid.length;
    var restOfWord = word.length - 1;

    var findWord = function(row, column){
        // Optimizes Search
        // Decreases Time By Half
        //----------------------------------------
        var sR1 = startObj['index'][0]+(row * 1),
        sC1 = startObj['index'][1]+(column * 1),
        sR2 = startObj['index'][0]+(row * 2),
        sC2 = startObj['index'][1]+(column * 2),
        sR3 = startObj['index'][0]+(row * 3),
        sC3 = startObj['index'][1]+(column * 3);

        var secondLetter = grid[sR1][sC1]['letter'],
        thirdLetter = grid[sR2][sC2]['letter'],
        fourthLetter = grid[sR3][sC3]['letter'];

        if (secondLetter + thirdLetter + fourthLetter != word.substring(1,4)) return false;

        var answerCoordinates = [startObj['index'].join(","),[sR1,sC1].join(","),[sR2,sC2].join(","),[sR3,sC3].join(",")];
        //----------------------------------------

        for(var index = 4; index < restOfWord+1; index++){
            checkRow = startObj['index'][0]+(row * index);
            checkColumn = startObj['index'][1]+(column * index);
            if(word[index] != grid[checkRow][checkColumn]['letter']){
                return false;
            }else{
                answerCoordinates.push([checkRow,checkColumn].join(","));
            }
        }
        if(answerCoordinates.length == restOfWord+1){
            this.board.answers.push({'word':word, 'coordinates':answerCoordinates});
            return true;
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

// Anything that has to access the db (like board validation)
// should hit a route
// Keep that in mind
// What Has To Happen on The Server Side
// Send the Game back to the server to start it

// exports.createGame = function(callback){
//     return new Game();
//     // Creates a game Object And Sends It to the admin
//     // The Room Joined by Players should be the id of the Game Key
//     // Game Key should probably be a hash of the the users Socket and the date
//     // as salt
// }

// // Requires Game Instance and listOfWords
// exports.startGame = function(game, listOfWords, callback){
//     // Runs game Validation and Set up
// }

// var db = require("../db");

// Requires Game Instance
// exports.saveGame = function(game, callback){}

// Requires Game Key or Id
// exports.getGame = function(callback){
//     var collection = db.collection("games");
//     collection.find().toArray(function(err,docs){
//         callback(err, docs);
//     });
// }

// Test the goddamn game

if(!module.parent){
    // TESTS Should Replace This
    var boardTest = new Board();
   boardTest.populate();
    // console.log(boardTest.letters);
    // console.log(boardTest.letterIndex);
    console.log(boardTest.letters.length);
    console.log(boardTest.letters[0].length);
    // Search Speed Needs to be increased
    // var searchBoard = new Search(boardTest);
    var lineReader = require('line-reader');
    var wordList = [];

    lineReader.eachLine('./zcodeBits/dictionary.txt', function(line) {
        if (line.length > 3){
            // searchBoard.checkFirstLetterOf(line.toUpperCase());
            wordList.push(line.toUpperCase());
        }
    }).then(function(){
        var gameTest = new Game();
        if (gameTest.validateBoard(boardTest, wordList)){
            for (var i = 0; i < boardTest.letters.length; i++){
                var row = [];
                for (var j = 0; j <boardTest.letters[0].length; j++){
                    row.push(boardTest.letters[i][j]['letter']);
                }
                console.log(row.join("-"));
            }
            console.log(boardTest.answers);
        }
        else{
            console.log("Fail");
            console.log(boardTest.answers);
        }
    });
}