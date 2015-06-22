function buildBoard(gameId){
	$.get('/board', function(data){
		var template = data;
		Mustache.parse(template);
		$.get('/letters', function(data){
			var board = Mustache.render(template, data);
			socket.emit('start game', board, gameId);
		});
	});
}

$(document).ready(function(){
	var nickname = prompt("Please enter a username:");
	var socket = io();
	var games = 0;
	var sessionId;
	
	socket.emit('userName', nickname);

	socket.on('userName taken', function(name){
		nickname = prompt(name + " has already been taken. Please enter a different username:");
		socket.emit('userName', nickname);
	});

	// Replace this with something else
	socket.on('sessionId', function(id){
		sessionId = id;
	});

	socket.on('start game', function(gameBoard){
		$('#createGame').html(gameBoard);
	});

	socket.on('gameInvitation', function(gameId){
		var template = $('#gameInviteTemplate').html();
		Mustache.parse(template);
		var rendered = Mustache.render(template, {'gameId':gameId});
		$('#messages').append(rendered);
	});

	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg));
	});

	socket.on('sendUsers', function(connected){
		$('#userList').empty()
		for (i=0; i < connected.length; i++){
			if(connected[i] != nickname){
				$('#userList').append($('<option>').text(connected[i]));
			}
		}
	});

	$('#createGameForm').on('submit', function(){
		var notifyUsers = $('#userList').val() || [];
		games += 1;
		var gameId = sessionId + String(games);
		socket.emit('newGame', notifyUsers, gameId);
		socket.emit('join game', gameId);
		$('#createGame').html("<button id='startGame' name='" + gameId + "'>Start</button>");
		return false
	});
	
	$('#chat').on('submit', '#gameInvitationForm', function(event){
		event.preventDefault();
		var room = $("input[name='gameNumber']").val();
		socket.emit('join game', room);
		$('#createGame').html("Waiting For Game To Start....");
		$('#messages').html("");
	});

	$('#createGame').on('click', '#startGame',function(){
		var gameId = sessionId + String(games);
		$.get('/board', function(data){
			var template = data;
			Mustache.parse(template);
			$.get('/letters', function(data){
				var board = Mustache.render(template, data);
				socket.emit('start game', board, gameId);
			});
		});
	});

	$('#messageForm').on('submit', function(){
		$('#messages').append($('<li>').text($('#m').val()));
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
});