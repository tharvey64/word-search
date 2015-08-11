var db = require("../db");

function gameInsert(game, cb){
    var cursor = db.collection("games");
    cursor.insert(game);
    cb(game);
}
// pass query here
function gameFind(key, cb){
    var cursor = db.collection("games");
    cursor.find({'gameKey':key}).toArray(function(err,docs){
        if(err){
            cb(err);
        }
        else{
            cb(null, buildGame(docs[0]));
        }
    });
}
function removePlayer(name, cb){
    var cursor = db.collection("games");
    cursor.find({'gameStatus': { $ne: 'Complete'},'players':{$elemMatch: {'nickname':name}}}).toArray(function(err,docs){
        if(err){
            cb(err);
        }
        else{
            cb(null, buildGame(docs[0]));
        }
    });
}
function gameUpdate(game, cb){
    var cursor = db.collection("games");
    cursor.findAndModify(
        {'gameKey':game.gameKey},
        [['_id','asc']],
        {$set: game},
        {},
        cb
    );
}

function buildGame(doc){
    if (!doc){
        return null
    }
    var board = doc['board'];
    var admin = doc['admin'];
    // Find Better Way
    game = new WordSearch(doc['admin'],doc['board']);
    game.gameKey = doc['gameKey'];
    game.currentTurn = doc['currentTurn'];
    game.consecutivePasses = doc['consecutivePasses'];
    game.players = doc['players'];
    game.foundWords = doc['foundWords'];
    game.gameStatus = doc['gameStatus'];
    return game
}

function Player(nickname, key){
    this.nickname = nickname;
    this.key = key;
    this.gameKey;
    this.active = true;
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
    this.board.setup();
    return Object.keys(this.board.letterIndex);
}
WordSearch.prototype.view = function(){
    return {
        'gameStatus':this.gameStatus,
        'currentPlayer': this.players[this.currentTurn].nickname,
        'turnSeq': this.turnSequence(),
        'wordsDone':this.foundWords,
        'scores': this.scores(),
        'grid': this.board.letters
    }
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
    // Re design  this method
    if (playerKey != this.players[this.currentTurn].key) return false;
    var player = this.players[this.currentTurn];
    // guess = {'word': guess word string,'coordinates':guess coordinates array}
    // End There Turn And Process There Guess
    this.endTurn();
    if (this.consecutivePasses != 0) this.consecutivePasses = 0;
    if (guess['coordinates'].length != guess['word'].length) return false;

    var guessLength = guess['coordinates'].length;
    var numberOfAnswers = this.board.answers.length;

    for(var index = 0; index < numberOfAnswers; index++){
        if (guessLength != this.board.answers[index]['coordinates'].length || this.board.answers[index]['found']) continue;
        var answer = this.board.answers[index]['coordinates'];
        for(var j = 0; j < guessLength; j++){
            if (!(~answer.indexOf(guess['coordinates'][j]))) break;
            if (j + 1 == guessLength){
                this.board.answers[index]['found'] = true;
                this.foundWords.push(this.board.answers[index]);
                player.score += guessLength;
                for (var i = 0; i < guessLength; i++){
                    var set = guess['coordinates'][i].split(",");
                    this.board.letters[Number(set[0])][Number(set[1])]['color'] = 'btn-danger';
                }
                // There has to Be A Better Way To End The Game
                this.endGame();
                return true;
            }
        } 
    }
    return false;
}
WordSearch.prototype.endTurn = function(){
    if (!this.endGame()){
        this.nextTurn();
    }
}
WordSearch.prototype.nextTurn = function(){
    // Refactor this
    var num_of_players = this.players.length, count = 0;
    while(!this.players[(this.currentTurn+1)%num_of_players].active && count < num_of_players){
        console.log("Loop")
        this.currentTurn++;
        count++;
    }
    if (count == num_of_players){
        this.gameStatus = "Complete";
    }
    else{
        this.currentTurn = (this.currentTurn+1)%num_of_players;
    }
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
    return true;
}
WordSearch.prototype.turnSequence = function(){
    var numberOfPlayers = this.players.length;
    var sequence = [];
    for(var i = 0; i < numberOfPlayers; i++){
        var idx = (this.currentTurn + i) % numberOfPlayers;
        sequence.push(this.players[idx].nickname);
    }
    return sequence;
}
WordSearch.prototype.scores = function(){
    var numberOfPlayers = this.players.length;
    var scoreHash = {};
    for(var i = 0; i < numberOfPlayers; i++){
        scoreHash[this.players[i].nickname] = this.players[i].score;
    }
    return scoreHash;
}
WordSearch.prototype.endGame = function(){
    if ((this.players.length == this.consecutivePasses) || (this.foundWords.length == this.board.answers.length)){
        this.gameStatus = "Complete";
        return true;
    }else{
        return false;
    }
}
WordSearch.prototype.quitGame = function(username) {
    var count = this.players.length;
    for (var i = 0; i < count; i++){
        if (username == this.players[i].nickname){
            if (this.gameStatus == "Building" || this.gameStatus == "Waiting"){
                this.players.splice(i, 1);
                this.currentTurn %= this.players.length;
            }
            else{
                this.players[i].active = false;
                if (this.currentTurn == i){
                    this.endTurn(); 
                }
            }
            return true;
        }
    }
    return false;
}

// -----------------------------------------
// I need a Prototype that Returns Game State

function Board(){
    this.answers = [];
    this.letters;
    this.letterIndex;
}
Board.prototype.setup = function(characterSet){
    characterSet = characterSet || ["A","A","A","A","B","B","C","C","D","D","E","E","E","E","E","F","F","G","G","H","H","I","I","I","I","I","J","J","K","K","L","L","M","M","N","N","O","O","O","O","O","P","P","Q","R","R","S","S","T","T","U","U","U","V","W","X","Y","Y","Y","Y","Z"];
    this.letters = [];
    this.letterIndex = {};
    for (var i = 0; i < 15; i++){
        this.letters.push([]);
        for(var j = 0; j < 15; j++){
            var newLetter = characterSet[Math.floor(Math.random()*characterSet.length)];
            if (!this.letterIndex.hasOwnProperty(newLetter)){
                this.letterIndex[newLetter] = [[i,j]];
            }else{
                this.letterIndex[newLetter].push([i,j]);
            }
            // add text color as property
            this.letters[i].push({'letter': newLetter,'index': [i,j],'color': 'btn-success'});
        }
    }
}


// I could turn this into a function
function Search(board){
    this.board = board;
}
Search.prototype.locate = function(wordObj){
    // Temporary Fix Words will Be entered in db in UpperCase
    // Need To Clear Duplicates From DB
    var word = wordObj['word'].toUpperCase();
    // Words Will Already Be First Letter Verified
    // if (!this.board.letterIndex.hasOwnProperty(word[0])){
    //     return false;
    // }
    // if(word.length > this.board.letters.length || word.length > this.board.letters[0].length){
    //     return false;
    // }
    var indexArray = this.board.letterIndex[word[0]];
    var numberOfOccurrences = indexArray.length;

    for (var i = 0; i < numberOfOccurrences; i++){
        var currentLetter = indexArray[i];
        this.checkSurround(currentLetter, word);
    }
}
Search.prototype.checkSurround = function(cooordinate, word){
    var grid = this.board.letters;
    var startObj = grid[cooordinate[0]][cooordinate[1]];
    var numberOfColumns = grid[0].length;
    var numberOfRows = grid.length;
    var restOfWord = word.length - 1;

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
            this.board.answers.push({'word':word, 'coordinates':answerCoordinates, 'found': false});
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

module.exports = {
    'Player': Player,
    'game': WordSearch, 
    'board': Board, 
    'search': Search,
    'gameFind': gameFind,
    'gameInsert': gameInsert,
    'gameUpdate': gameUpdate,
    'removePlayer': removePlayer,
};

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