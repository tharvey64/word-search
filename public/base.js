function mainLobby(nickname){
	var gameCreationTemplate = $('#createGameFormTemplate').html();
	$('#createGame').empty()
	Mustache.parse(gameCreationTemplate);
	var rendered = Mustache.render(gameCreationTemplate);
	$('#createGame').append(rendered);
	$("#createGameForm input[name='nickname']").val(nickname);
}
function buildBoard(gameID, playerID, nickname, socket){
	var gameOver = false;
	$.get('/games/board', function(data){
		var boardTemplate = data;
		Mustache.parse(boardTemplate);
		$.get('/games/info/' + gameID, {'player': playerID, 'nickname': nickname}, function(data){
			if (data['gameStatus'] == "Complete"){
				mainLobby(nickname);
				$('.gameChat').remove();
				socket.emit('game over', gameID);
			}
			else{
				var players = [],
				numberOfPlayers = data.turnSeq.length; 
				for (var i=0;i<numberOfPlayers;i++){
					var p = {'name': data.turnSeq[i], 'score': data.scores[data.turnSeq[i]]}
					players.push(p);
				}
				players.sort(function(a,b){
					return b.score - a.score
				});
				data['order'] = players;
				data['gameID'] = gameID;
				data['playerID'] = playerID;
				data['nickname'] = nickname;
				var board = Mustache.render(boardTemplate, data);
				$('#createGame').html(board);
			}
			console.log('Callback');
		});
	});
	console.log(gameOver);
	return gameOver;
}
function gameChat(gameID){
	var chatTemplate = $('#gameChatTabTemplate').html();
	Mustache.parse(chatTemplate);
	var chatRendered = Mustache.render(chatTemplate, {'gameID': gameID});
	$('#chat').append(chatRendered);
	$('#chatTabs').append($('<li role="presentation" class="gameChat" data-target=".gameChat"><a href="#">Game</a></li>'));
	$('div.gameChat').hide();
}
$(document).ready(function(){
	// User Model
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
		$('#mainMessages').append($('<li>').text(msg));
	});

	socket.on('game message', function(msg){
		$('#gameMessages').append($('<li>').text(msg));
	});
	// Message Sending
	$('#chat').on('submit', '#gameMessageForm',function(event){
		event.preventDefault();
		var message = this.elements.gameM.value;
		var gameID = this.elements.gameID.value;
		// Message Appended To Submiters Screen
		var item = $('<li>')
		item.attr("class","sentMessage");
		$('#gameMessages').append(item.text("Me: " + message));
		socket.emit('game message', nickname + ": " + message, gameID);
		this.elements.gameM.value = "";
	});
	$('#messageForm').on('submit', function(event){
		event.preventDefault();
		// Good Dammit Change All Of This Stuff to JQUERY
		var message = this.elements.mainM.value;
		// Message Appended To Submiters Screen
		var item = $('<li>')
		item.attr("class","sentMessage");
		$('#mainMessages').append(item.text("Me: " + message));
		socket.emit('chat message', nickname + ": " + message);
		this.elements.mainM.value = "";
	});
	// Chat Toggle
	$('#chatTabs').on('click', 'li',function(event){
		event.preventDefault();
		$('div.active').hide();
		$('.active').toggleClass('active');
		// Change This To Jquery
		$(this.dataset.target).toggleClass('active');
		$('div.active').show();
	});
	// Socket Game 
	socket.on('gameInvitation', function(gameID, admin){
		var template = $('#gameInviteTemplate').html();
		Mustache.parse(template);
		var rendered = Mustache.render(template, {'gameID':gameID,'nickname':nickname, 'admin': admin});
		$('#mainMessages').append(rendered);
	});

	socket.on('sendUsers', function(connected){
		$('#userList').empty()
		for (var i=0; i < connected.length; i++){
			if(connected[i] != nickname){
				$('#userList').append($('<option>').text(connected[i]));
			}
		}
	});

	socket.on('get game state', function(gameID){
		buildBoard(gameID, playerID, nickname, socket);
	});

	$('#createGame').on('submit', '#createGameForm',function(event){
		event.preventDefault();
		var notifyUsers = $('#userList').val() || [];

		$.post("games/create/",$(this).serialize(), function(data){
			// This Should Be a Redirect
			var template = $('#startGameTemplate').html();
			Mustache.parse(template);
			var rendered = Mustache.render(template, data);
			$('#createGame').html(rendered);
			playerID = data.playerID
			socket.emit('newGame', notifyUsers, data.gameID, nickname);
			socket.emit('join game', data.gameID);
			// Add Chat Tab
			gameChat(data.gameID);
		});
	});
	// Player Joins A Game
	// Should Redirect Player To Game Lobby
	// Deactivate The Join Buttons After The Game Starts
	$('#chat').on('submit', '#gameInvitationForm', function(event){
		event.preventDefault();
		var form = $(this);
		var room = form.children("input[name='gameID']").val();
		$.post(form.attr("action").val(), form.serialize(), function(data){
			if (data.registered){
				playerID = data.playerID
				socket.emit('join game', room);
				// Add Chat Tab
				gameChat(room);
				$('#createGame').html("Waiting For Game To Start....");
				// This Will Switch to The Game Chat and Deactivate the join button
				$('#messages').html("");
			}
			else{
				// Add this to the chat
				// Try to make this informative
				// ie Game Full, Already Joined, Not Invited
				console.log("Unable to join.");
			}
		});
		// Join The Game And Redirect To Waiting Room
	});
	// Move This To Game Lobby
	$('#createGame').on('submit', '#startGameForm',function(event){
		event.preventDefault();
		var form = $(this);
		var gameID = form.children("input[name='gameID']").val();
		$.post(form.attr("action").val(),form.serialize(),function(data){
			if (!data.success){
				return false;
			}
			// socket event to update game
			socket.emit('get game state', gameID);
		});
	});
	// Triggered in wordSearchTurn.js
	$('#createGame').on('endOfTurn', function(event, gameID){
		socket.emit('get game state', gameID);
	});
});