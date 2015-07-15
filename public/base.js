// This Should Be The Lobby Code 
// When You Start A Game There should be a Redirect
function buildBoard(game, player, nickname){
	$.get('/games/board', function(data){
		var template = data;
		Mustache.parse(template);
		$.get('/games/info/' + game, {'player': player, 'nickname': nickname}, function(data){
			var scores = [],
			numberOfPlayers = data.turnSeq.length; 
			for (i=0;i<numberOfPlayers;i++){
				scores.push(data.scores[data.turnSeq[i]]);
			}
			data.scores = scores;
			var board = Mustache.render(template, data);
			$('#createGame').html(board);
		});
	});
}
// This is going to look a bit different and cleaner by tomorrow
$(document).ready(function(){
	var nickname = prompt("Please enter a username:");
	var socket = io();
	var playerID;
	socket.emit('userName', nickname);

	socket.on('userName taken', function(name){
		nickname = prompt(name + " has already been taken. Please enter a different username:");
		socket.emit('userName', nickname);
	});
	// Test What Happens When Nickname is taken
	$("#createGameForm input[name='nickname']").val(nickname);

	// Socket Chat
	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg));
	});
	// Message Send
	$('#messageForm').on('submit', function(){
		$('#messages').append($('<li>').text($('#m').val()));
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
	// Socket Game 
	// socket.on('start game', function(gameID){
	// 	$('#createGame').html(gameBoard);
	// });
	socket.on('start game', function(gameBoard){
		$('#createGame').html(gameBoard);
	});

	socket.on('gameInvitation', function(gameID){
		var template = $('#gameInviteTemplate').html();
		Mustache.parse(template);
		var rendered = Mustache.render(template, {'gameID':gameID,'nickname':nickname});
		$('#messages').append(rendered);
	});

	socket.on('sendUsers', function(connected){
		$('#userList').empty()
		for (i=0; i < connected.length; i++){
			if(connected[i] != nickname){
				$('#userList').append($('<option>').text(connected[i]));
			}
		}
	});

	$('#createGameForm').on('submit', function(event){
		event.preventDefault();
		var notifyUsers = $('#userList').val() || [];
		
		$.post("games/create/",$(this).serialize(), function(data){
			// This Should Be a Redirect
			var template = $('#startGameTemplate').html();
			Mustache.parse(template);
			var rendered = Mustache.render(template, data);
			$('#createGame').html(rendered);
			playerID = data.playerID
			socket.emit('newGame', notifyUsers, data.gameID);
			socket.emit('join game', data.gameID);
		});
	});
	// Player Joins A Game
	// Should Redirect Player To Game Lobby
	$('#chat').on('submit', '#gameInvitationForm', function(event){
		event.preventDefault();
		var room = this.elements.gameID.value
		$.post("/games/join", $(this).serialize(), function(data){
			if (data.registered){
				playerID = data.playerID
				console.log("Joining");
				socket.emit('join game', room);
				$('#createGame').html("Waiting For Game To Start....");
				$('#messages').html("");
			}
		});
		// Join The Game And Redirect To Waiting Room
	});

	// Move This To Game Lobby
	$('#createGame').on('submit', '#startGameForm',function(event){
		event.preventDefault();
		var gameID = this.elements.gameID.value
		$.post('/games/start/',$(this).serialize(),function(data){
			if (!data.success){
				return false;
			}
			// socket event to update game
			socket.emit('get game state', gameID);
		});
	});
	socket.on('get game state', function(gameID){
		buildBoard(gameID, playerID, nickname);
	});
});