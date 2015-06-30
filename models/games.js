// Players Need 
// PlayerID
// Nickname
// Score 
// GameID
function Player(nickname, key){
    this.nickname = nickname;
    this.key = key;
    this.gameKey;
    this.score = 0;
}
Player.prototype.compare = function(player){
    // Could add gameKey
    if (this.nickname == player.nickname) return true;
    if (this.key == player.key) return true;
}

function Game(admin, board){
    this.admin = admin;
    this.gameKey = admin.gameKey;
    this.currentTurn = 0;
    this.consecutivePasses = 0;
    // Adding the Admin on Init depends on how i set the client side up
    this.players = [admin];
    this.board = board;
    this.foundWords = [];
    // "Building","Waiting","In Play","Complete"
    this.gameStatus = "Building";
}
Game.prototype.setup = function(){
    // Wow Game Class Is Tangled as Hell
    this.board.setup();
    return Object.keys(this.board.letterIndex);
}
Game.prototype.validateBoard = function(searcher, wordList){
    // returns True or False
    var validator = new searcher(this.board);
    var limit = wordList.length;

    for (var i=0;i < limit; i++){
        validator.locate(wordList[i]);
    }
    if (this.board.answers.length < 10){
        return false;
    }
    this.gameStatus = "Waiting";
    return true;
}
Game.prototype.checkGuess = function(playerKey, guess){
    if (playerKey != this.players[this.currentTurn].key) return false;
    var player = this.players[this.currentTurn];
    // guess = {'word': guess word string,'coordinates':guess coordinates array}
    // End There Turn And Process There Guess
    this.endTurn();
    // This Should Prevent Multiple submissions

    if (this.consecutivePasses != 0) this.consecutivePasses = 0;

    if (guess['cooordinates'].length != guess['word'].length) return false;

    var guessLength = guess['cooordinates'].length;
    var numberOfAnswers = this.board.answers.length;

    for(var index = 0; index < numberOfAnswers; index++){
        if (guessLength != this.board.answers[i]['cooordinates'].length) continue;

        var answer = this.board.answers[i]['cooordinates'];
        for(var j = 0; j < guessLength; j++){
            if (!(~answer.indexOf(guess['cooordinates'][i]))) break;

            if (j + 1 == guessLength){
                this.foundWords.push(this.board.answers[i]);
                player.score += guessLength;
                // if (this.foundWords.length == this.board.answers.length) this.gameOver();
                return true;
            }
        } 
    }
    return false;
}
Game.prototype.endTurn = function(){
    // if(!this.endGame())
    this.currentTurn += 1;
    this.currentTurn %= this.players.length;
}
Game.prototype.pass = function(){
    this.consecutivePasses += 1;
    // if ((this.players.length == this.consecutivePasses) this.gameOver();
    this.endTurn();
}
Game.prototype.joinGame = function(user){
    var count = this.players.length;
    // Validate Uniqueness
    for (var i = 0; i < count; i++){
        if (user.compare(this.players[i])) return false;
    }
    this.players.push(user);
    return true
}
Game.prototype.endGame = function(){
    if ((this.players.length == this.consecutivePasses) || (this.foundWords.length == this.board.answers.length)){
        return true;
    }else{
        return false
    }
    // These Two Conditions can be checked elsewhere
    // Putting them Here makes it easy to Add more conditions that terminate the game
    // Making this an object would make the Game more Flexible
}
// Game.prototype.quitGame = function(username) {
    
//     var index = this.players.indexOf(username);
//     if(!(~index)) return false;
    
//     var removedPlayer = this.players.splice(index, 1);
    
//     if (removedPlayer != username){
//         this.players.splice(index, 0, removedPlayer);
//         return false;
//     }else{
//         return true;
//     }
// }
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
// I need a Prototype that Returns Game State

function Board(){
    this.answers = [];
    this.letters;
    this.letterIndex;
}
Board.prototype.setup = function(characterSet){
    characterSet = characterSet || ["A","A","A","B","B","C","C","D","D","E","E","E","E","F","F","G","G","H","H","I","I","I","I","J","J","K","K","L","L","M","M","N","N","O","O","O","O","P","P","Q","R","R","S","S","T","T","U","U","V","W","X","Y","Y","Z"];

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
            // add text color as property
            this.letters[i].push({'letter': newLetter,'index': [i,j]});
        }
    }
}


// I could turn this into a function
function Search(board){
    this.board = board;
}
Search.prototype.locate = function(wordObj){
    // Temporary Fix Words will Be entered in db in UpperCase
    var word = wordObj['word'].toUpperCase();
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

module.exports = {'Player': Player,'game': Game, 'board': Board, 'search': Search};

if(!module.parent){
    // TESTS Should Replace This
    var boardTest = new Board();
   boardTest.setup();
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
            // searchBoard.locate(line.toUpperCase());
            wordList.push(line.toUpperCase());
        }
    }).then(function(){
        var gameTest = new Game();
        if (gameTest.validateBoard(wordList)){
            for (var i = 0; i < gameTest.board.letters.length; i++){
                var row = [];
                for (var j = 0; j <gameTest.board.letters[0].length; j++){
                    row.push(gameTest.board.letters[i][j]['letter']);
                }
                console.log(row.join("-"));
            }
            console.log(gameTest.board.answers);
        }
        else{
            console.log("Fail");
            console.log(gameTest.board.answers);
        }
    });
}