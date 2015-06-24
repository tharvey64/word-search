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
            // This game desperatly needs a db
            for(i=0; i < users.length; i++){
                socket.broadcast.to(connected[users[i]]).emit('gameInvitation', gameId);
            }
        });

        socket.on('join game', function(gameId){
            socket.join(gameId);
            socket.to(gameId).emit('chat message', name + " Joined Game");
        });

        socket.on('start game', function(board, gameId){
            tempIO.to(gameId).emit('start game', board);
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