function Player(nickname, key){
    this.nickname = nickname;
    this.key = key;
    this.gameKey;
    this.score = 0;
}

function WordSearch(admin, board){
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
WordSearch.prototype.setup = function(){
    // Wow Game Class Is Tangled as Hell
    this.board.setup();
    return Object.keys(this.board.letterIndex);
}
WordSearch.prototype.validateBoard = function(searcher, wordList){
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
WordSearch.prototype.checkGuess = function(playerKey, guess){
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
WordSearch.prototype.endTurn = function(){
    // if(!this.endGame())
    this.currentTurn += 1;
    this.currentTurn %= this.players.length;
}
WordSearch.prototype.pass = function(){
    this.consecutivePasses += 1;
    // if ((this.players.length == this.consecutivePasses) this.gameOver();
    this.endTurn();
}
WordSearch.prototype.isPlayer = function(user){
    var count = this.players.length;
    for (var i = 0; i < count; i++){
        if (user.key == this.players[i].key && user.nickname == this.players[i].nickname){
            return true;
        }
    }
    return false;
}
WordSearch.prototype.joinGame = function(user){
    var count = this.players.length;
    for (var i = 0; i < count; i++){
        if(user.key == this.players[i].key || user.nickname == this.players[i].nickname){
            return false;
        }
    }
    this.players.push(user);
    return true
}
WordSearch.prototype.endGame = function(){
    if ((this.players.length == this.consecutivePasses) || (this.foundWords.length == this.board.answers.length)){
        return true;
    }else{
        return false
    }
    // These Two Conditions can be checked elsewhere
    // Putting them Here makes it easy to Add more conditions that terminate the game
    // Making this an object would make the Game more Flexible
}
// WordSearch.prototype.quitGame = function(username) {
    
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
    // if (!this.board.letterIndex.hasOwnProperty(word[0])){
    //     return false;
    // }
    // if(word.length > this.board.letters.length || word.length > this.board.letters[0].length){
    //     return false;
    // }
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
    var success = false;

    var findWord = function (row, column){
        var answerCoordinates = [startObj['index']]
        //----------------------------------------
        for(var index = 1; index <= restOfWord; index++){
            checkRow = startObj['index'][0]+(row * index);
            checkColumn = startObj['index'][1]+(column * index);
            if(word[index] != grid[checkRow][checkColumn]['letter']){
                return false;
            }else{
                answerCoordinates.push([checkRow,checkColumn]);
            }
        }
        answerLength = answerCoordinates.length
        if(answerLength == restOfWord+1){
            for (var idx = 0;idx < answerLength; idx++){
                answerCoordinates[idx]=answerCoordinates[idx].join(",");
            }
            this.board.answers.push({'word':word, 'coordinates':answerCoordinates});
            success = true;
            return true;
        }
    }
    if (startObj['index'][1]-restOfWord >= 0){
        findWord.call(this,0,-1);
    }
    if (startObj['index'][1]+restOfWord < numberOfColumns){
        findWord.call(this,0,1);
    }
    if (startObj['index'][0]-restOfWord >= 0){
        findWord.call(this,-1,0);
        if (startObj['index'][1]-restOfWord >= 0){
            findWord.call(this,-1,-1);
        }
        if (startObj['index'][1]+restOfWord < numberOfColumns){
            findWord.call(this,-1,1);
        }
    }
    if (startObj['index'][0]+restOfWord < numberOfRows){
        findWord.call(this,1,0);
        if (startObj['index'][1]+restOfWord < numberOfColumns){
            findWord.call(this,1,1);
        }
        if (startObj['index'][1]-restOfWord >= 0){
            findWord.call(this,1,-1);
        }
    }
}

module.exports = {'Player': Player,'game': WordSearch, 'board': Board, 'search': Search};
    // if (startObj['index'][1]-restOfWord >= 0){
    //     // Row Column
    //     findWord.call(this,0,-1)
    // }
    // if (startObj['index'][0]-restOfWord >= 0 && startObj['index'][1]-restOfWord >= 0){
    //     findWord.call(this,-1,-1)
    // }
    // if (startObj['index'][0]-restOfWord >= 0){
    //     findWord.call(this,-1,0);
    // }
    // if (startObj['index'][0]-restOfWord >= 0 && startObj['index'][1]+restOfWord < numberOfColumns){
    //     findWord.call(this,-1,1);
    // }
    // if (startObj['index'][1]+restOfWord < numberOfColumns){
    //     findWord.call(this,0,1);
    // }
    // if (startObj['index'][0]+restOfWord < numberOfRows && startObj['index'][1]+restOfWord < numberOfColumns){
    //     findWord.call(this,1,1);
    // }
    // if (startObj['index'][0]+restOfWord < numberOfRows){
    //     findWord.call(this,1,0);
    // }
    // if (startObj['index'][0]+restOfWord < numberOfRows && startObj['index'][1]-restOfWord >= 0){
    //     findWord.call(this,1,-1);
    // }

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