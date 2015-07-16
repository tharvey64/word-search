function buildBoard(game, player, nickname){
	$.get('/games/board', function(data){
		var template = data;
		Mustache.parse(template);
		$.get('/games/info/' + game, {'player': player, 'nickname': nickname}, function(data){
			var players = [],
			numberOfPlayers = data.turnSeq.length; 
			for (i=0;i<numberOfPlayers;i++){
				var p = {'name': data.turnSeq[i], 'score': data.scores[data.turnSeq[i]]}
				players.push(p);
			}
			// cant really test this until play route works
			players.sort(function(a,b){
				return b.score - a.score
			});
			data['order'] = players;
			var board = Mustache.render(template, data);
			$('#createGame').html(board);
		});
	});
}
$(document).ready(function(){
	var nickname = prompt("Please enter a username:");
	var socket = io();
	var playerID;
	socket.emit('userName', nickname);
	// Edit Here
	$("#createGameForm input[name='nickname']").val(nickname);
	
	// Confirm Username Has Not Been Taken
	socket.on('userName taken', function(name){
		// Make This Happen on success or failure
		// Loop until success
		nickname = prompt(name + " has already been taken. Please enter a different username:");
		socket.emit('userName', nickname);
		$("#createGameForm input[name='nickname']").val(nickname);
	});

	// Recieving Chat Message
	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg));
	});
	// Message Sending
	$('#messageForm').on('submit', function(event){
		event.preventDefault();
		var message = this.elements.m.value;
		// Message Appended To Submiters Screen
		var item = $('<li>')
		item.attr("class","sentMessage");
		$('#messages').append(item.text("Me: " + message));

		socket.emit('chat message', nickname + ": " + message);
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