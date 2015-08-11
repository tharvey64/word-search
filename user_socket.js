var gameModels = require("./models/games");
var make = require('./lib/idGenerator');
var connected = {};
var mainLobby = {};

function playerList(gameKey, cb){
    gameModels.gameFind(gameKey, function(err, game){
        if (err){
            throw err;
        }
        else{
            var ps = game.players.map(function(obj){return obj.nickname;});
            cb(gameKey,ps);
        }
    });
}

exports.live = function(tempIO){
    tempIO.on('connection', function(socket){
        var name;

        socket.on('userName', function(userName){
            if (userName === ""){
                var userName = "Guest" + make.key();
                socket.emit('generated name', userName);
            }
            if (connected.hasOwnProperty(userName)){
                socket.emit('userName taken', userName);
            }
            else{
                name = userName;
                connected[userName] = socket.id;
                mainLobby[userName] = socket.id;
                tempIO.emit('sendUsers', Object.keys(mainLobby));
            }
        });

        socket.on('newGame',function(users, gameId, admin){
            for(i=0; i < users.length; i++){
                socket.broadcast.to(connected[users[i]]).emit('gameInvitation', gameId, admin);
            }
        });
        // Use leave in the same fashion as join
        socket.on('join game', function(gameID){
            socket.join(gameID);
            // Lobby Hack
            delete mainLobby[name];
            // maybe this should be an html string
            tempIO.emit('sendUsers', Object.keys(mainLobby));
            playerList(gameID, function(key,players){
                tempIO.to(key).emit('player list', players);
            });
            socket.to(gameID).emit('game message', name + " Joined Game");
        });

        socket.on('get game state', function(gameID){
            tempIO.to(gameID).emit('get game state', gameID);
            // tempIO.to(gameID).emit('game message', "Game Starting");
        });

        socket.on('game over', function(gameID){
            socket.leave(gameID);
            mainLobby[name] = socket.id;
            tempIO.emit('sendUsers', Object.keys(mainLobby));
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
            delete mainLobby[name];
            delete connected[name];
            gameModels.removePlayer(name,function(err, game){
                if (game){
                    game.quitGame(name);
                    gameModels.gameUpdate(game, function(err, data){
                        if (data.value.gameStatus == "Building" || data.value.gameStatus == "Waiting"){
                            playerList(data.value.gameKey, function(key,players){
                                tempIO.to(key).emit('player list', players);
                            });
                        }
                        else{
                            tempIO.to(data.value.gameKey).emit('get game state', data.value.gameKey);
                        }
                    });
                }
                tempIO.emit('sendUsers', Object.keys(mainLobby));
            });
        });
    });
}