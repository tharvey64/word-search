// This Should Be The Lobby Code 
// When You Start A Game There should be a Redirect
function buildBoard(gameId){
    $.get('/game/board', function(data){
        var template = data;
        Mustache.parse(template);
        $.get('/game/letters', function(data){
            var board = Mustache.render(template, data);
            socket.emit('start game', board, gameId);
        });
    });
}
$(document).ready(function(){
    // The Username and Room should be sent over with this 
    var socket = io();

    // Socket Chat
    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
    // Message Send
    $('#messageForm').on('submit', function(event){
        event.preventDefault;
        $('#messages').append($('<li>').text($('#m').val()));
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
    });
    // Socket Game 
    socket.on('start game', function(gameBoard){
        $('#createGame').html(gameBoard);
    });
    // FIX
    // -----------------------------------------
    // This Stuff Should Be on page load
    $('#createGameForm').on('submit', function(event){
        event.preventDefault();
        var gameId;
        var notifyUsers = $('#userList').val() || [];
        
        $.post("games/create/",$(this).serialize(), function(event, data){
            event.preventDefault();
            // This Should Be a Redirect
            // FIX
            // -----------------------------------------
            var template = $('#startGameTemplate').html();
            Mustache.parse(template);
            var rendered = Mustache.render(template, data);
            $('#createGame').html(rendered);
            socket.emit('newGame', notifyUsers, data.game);

        });
    });

    // Move This To Game Lobby
    $('#createGame').on('click', '#startGame',function(){
        $.get('/games/board', function(data){
            var template = data;
            Mustache.parse(template);
            $.get('/games/letters', function(data){
                var board = Mustache.render(template, data);
                // Change This GameID Garbage
                socket.emit('start game', board, gameId);
            });
        });
    });
});