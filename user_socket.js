var connected = {};

exports.live = function(tempIO){
    tempIO.on('connection', function(socket){
        var name;
        socket.emit('sessionId', socket.id);

        socket.on('userName', function(userName){
            if (connected.hasOwnProperty(userName)){
                socket.emit('userName taken', userName);
            }
            else{
                name = userName;
                connected[userName] = socket.id;
                tempIO.emit('sendUsers', Object.keys(connected));   
            }
        });

        socket.on('newGame',function(users, gameId){
            for(i=0; i < users.length; i++){
                socket.broadcast.to(connected[users[i]]).emit('gameInvitation', gameId);
            }
        });
        // Use leave in the same fashion as join
        socket.on('join game', function(gameID){
            // Join Game Route
            socket.join(gameID);
            // maybe this should be an html string
            socket.to(gameID).emit('game message', name + " Joined Game");
        });

        socket.on('get game state', function(gameID){
            tempIO.to(gameID).emit('get game state', gameID);
            // tempIO.to(gameID).emit('game message', "Game Starting");
        });

        socket.on('chat message', function(msg){
            socket.broadcast.emit('chat message', msg);
        });
        
        socket.on('game message', function(msg, gameID){
            socket.to(gameID).emit('game message', msg);
        });

        // socket.on('private message', function(msg, somePlayerMarker){});

        socket.on('disconnect', function(){
            tempIO.emit('chat message', name + " logged out.");
            delete connected[name];
            tempIO.emit('sendUsers', Object.keys(connected));
        });
    });
}