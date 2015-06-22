// Search and Board Work
// Search is not as fast as i would like
// Incorporate This Into The Rest of the App 
function Board(){
    this.alphabet = ["A","A","A","B","B","C","C","D","D","E","E","E","E","F","F","G","G","H","H","I","I","I","I","J","J","K","K","L","L","M","M","N","N","O","O","O","O","P","P","Q","R","S","T","U","U","V","W","X","Y","Z"];
    this.answers = [];
    this.letters;
    this.letterIndex = {};
}
Board.prototype.populate = function(){
    this.letters = [];
    for (i = 0; i < 15; i++){
        this.letters.push([]);
        for(j = 0; j < 15; j++){
            var newLetter = this.alphabet[Math.floor(Math.random()*this.alphabet.length)];
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
    // Begin to check surrounding letters
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

module.exports = {
    "Board" : Board,
    "Search": Search
}
// TESTS Should Replace This
game = new Board();
// console.log(game.alphabet);
// console.log(game.letters);
// console.log(game.letterIndex);
// console.log(game.answers);
game.populate();
// console.log(game.letters);
// console.log(game.letterIndex);
// console.log(game.letters.length);
// console.log(game.letters[0].length);
// for (i = 0; i < game.letters.length; i++){
//     var line = [];
//     for (j = 0; j < game.letters[0].length; j++){
//         line.push(game.letters[i][j]['letter']);
//     }
//     console.log(line.join("-"));
// }
// game.populate();
// console.log();
// for (i = 0; i < game.letters.length; i++){
//     var line = [];
//     for (j = 0; j < game.letters[0].length; j++){
//         line.push(game.letters[i][j]['letter']);
//     }
//     console.log(line.join("-"));
// }
// Search Speed Needs to be increased
searchBoard = new Search(game);
lineReader = require('line-reader');

lineReader.eachLine('dictionary.txt', function(line) {
    if (line.length > 3){
        searchBoard.checkFirstLetter(line.toUpperCase());
    }
}).then(function(){
    for (i = 0; i < game.letters.length; i++){
        var line = [];
    for (j = 0; j < game.letters[0].length; j++){
        line.push(game.letters[i][j]['letter']);
    }
    console.log(line.join("-"));
}
    console.log(game.answers);
    console.log("Done");
});
