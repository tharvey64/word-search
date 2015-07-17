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
            // Create Game Route
            // This game desperatly needs a db
            for(i=0; i < users.length; i++){
                socket.broadcast.to(connected[users[i]]).emit('gameInvitation', gameId);
            }
        });

        socket.on('join game', function(gameID){
            // Join Game Route
            socket.join(gameID);
            // maybe this should be an html string
            socket.to(gameID).emit('chat message', name + " Joined Game");
        });

        socket.on('get game state', function(gameID){
            tempIO.to(gameID).emit('get game state', gameID);
            tempIO.to(gameID).emit('chat message', "Game Starting");
        });

        socket.on('chat message', function(msg){
            socket.broadcast.emit('chat message', msg);
        });
        
        socket.on('disconnect', function(){
            tempIO.emit('chat message', name + " logged out.");
            delete connected[name];
            tempIO.emit('sendUsers', Object.keys(connected));
        });
    });
}