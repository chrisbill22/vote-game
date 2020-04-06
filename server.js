var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/chatTest';
var users = Array();
var userID = 0;
var game = Array();
var totalGames = 1;


var registrationOpen = true;
var team1 = Array();
var team2 = Array();
var team1_votes = Array(0, 0, 0, 0);
var team2_votes = Array(0, 0, 0, 0);
var team1_vote_number = 0;
var team2_vote_number = 0;
var team1_novote_number = 0;
var team2_novote_number = 0;




function getMessages(limit, callback) {
    mongo.connect(url, function (err, db) {
        console.log("Getting messages...");

        var messages = Array();
        var collection = db.collection('chat messages').find().sort({
            _id: -1
        }).limit(limit);
        collection.each(function (err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                messages.push(doc.content);
            } else {
                callback(messages);
            }
        });
        /*var stream = collection.find().sort({
            _id: -1
        }).limit(limit).stream();
        stream.on('error', function (err) {
            console.error(err);
        });
        stream.on('data', function (chat) {
            socket.emit('chat message', chat.content);
        });*/
        console.log("Messages received");
    });
}

function saveMessage(message) {
    mongo.connect(url, function (err, db) {
        var collection = db.collection('chat messages');
        collection.insert({
            content: message
        }, function (err, o) {
            assert.equal(null, err);
            console.log("chat message inserted to db: " + message);
        });
    });
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}




app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/admin.html');
});

app.get('/map/:id', function (req, res) {
    res.sendFile(__dirname + '/maps/' + req.params.id);
});

app.get('/map/:id/:image', function (req, res) {
    res.sendFile(__dirname + '/maps/' + req.params.id + "/" + req.params.image);
})



io.on('connection', function (socket) {

//PLAYER
    socket.on('register player', function (name) {
        console.log(name + ' has joined');
        if (users.length > 0) {
            users.forEach(function (item, id) {
                socket.emit('new player', item.name, item.id);
            });
        }
        emitAllBuiltGames();
        users.push({
            id: userID,
            name: name,
            socket: socket.id
        });
        socket.emit('assigned id', userID, users.length);
        io.emit('new player', name, userID, users.length);
        userID++;
    });

    socket.on('disconnect', function () {
        users.forEach(function (item, id) {
            if (item.socket == socket.id) {
                io.emit('user disconnect', item.id, users.length - 1);
                console.log(item.name + ' has left');
                users.splice(id, 1);
            }
        });
    });


//ADMIN
    socket.on('admin request', function (pass) {
        if (pass === "1234abcd") {
            socket.emit('admin pass');
            console.log('**ADMIN**');
            if (users.length > 0) {
                users.forEach(function (item, id) {
                    socket.emit('new player', item.name, item.id, users.length);
                });
            }
            emitAllBuiltGames();
        }
    });


//GAME BUILD
    function buildNewGame(gameType) {
        console.log("building game..")
            //Define the game

        if (gameType == 0) {
            //GAME 0 INFORMATION
            //TEAMS: 2
            //VOTE OPTIONS: 4
            game.push({
                type: 0,
                numberOfTeams: 2,
                voteOptions: 4,
                waitingUsers: Array(),
                teams: Array({
                    name:"red",
                    id:0,
                    users:Array()
                }, {name:"blue",
                    id:1,
                    users:Array()
                })
            });
        } else {
            console.error("INVALID GAME TYPE");
        }
        var gamePosition = game.length - 1;

        //build the game
        //set game ID
        game[gamePosition].ID = totalGames;
        totalGames++;

        //setup votes for game
        for (i = 0; i != game[gamePosition].numberOfTeams - 1; i++) {
            game[gamePosition].teams.push({
                teamID: i,
                teamVotes: Array(0, 0, 0, 0),
                players: Array()
            });
        }

        return game[gamePosition].ID;
    }

    function emitAllBuiltGames() {
        for (i = 0; i != game.length; i++) {
            socket.emit("new game build", game[i].ID);
        }
    }

    socket.on('build game request', function () {
        var gameID = buildNewGame(0);
        io.emit("new game build", gameID);
    });

    socket.on('delete game', function (ID) {
        for (i = 0; i != game.length; i++) {
            if (game[i].ID == ID) {
                game.splice(i, 1);
            }
        }
    });

//GAME CONTROLLS
    
    function returnGameByID(gameID){
        for (i = 0; i != game.length; i++) {
            if (game[i].ID == gameID) {
                return game[i];
            }
        }
    }
    
    socket.on('enter game waiting room', function(playerID, gameID){
        var game = returnGameByID(gameID);
        game.waitingUsers.push(playerID);
        io.emit("player entered waiting room", playerID, gameID);
    });
    
    socket.on('start game', function () {

        console.log("starting game..")

        //divide up teams randomly
        var randomUsers = shuffle(users);
        team1 = randomUsers.splice(0, Math.floor(randomUsers.length / 2));
        team2 = randomUsers;
        console.log("teams assigned..");
        io.emit("starting game");
    });


//GAME SETUP
    socket.on('request team', function (id) {
        team1.forEach(function (item, count) {
            if (item.id == id) {
                //team 0, game 0
                socket.emit("game info", 0, 0, 'test-map');
            }
        });
        team2.forEach(function (item, count) {
            if (item.id == id) {
                //team 1, game 0
                socket.emit("game info", 1, 0, 'test-map');
            }
        });
    });

    //GAME VOTE
    socket.on('resume game', function () {
        io.emit("resuming game");
    });
    socket.on('pause game', function () {
        io.emit("pausing game");
    });

    socket.on('vote', function (playerID, teamID, voteID) {
        console.log("Incoming Vote");
        /*if(voteID != -1){
            if (teamID == 0) {
                team1_votes[voteID]++;
                team1_vote_number++;
                if (team1_vote_number == team1.length) {
                    console.log("team1 advance");
                    submitVote(teamID);
                }
            } else {
                team2_votes[voteID] ++;
                team2_vote_number++;
                if (team2_vote_number == team2.length) {
                    console.log("team1 advance");
                    submitVote(teamID);
                }
            }
        }else{
            //they never sent in a vote
            if (teamID == 0) {
                team1_vote_number++;
                team1_novote_number++;
            }else{
                team2_vote_number++;
                team1_novote_number++;
            }
        }*/

        //------

        if (teamID == 0) {
            team1_vote_number++;
            //what to do with no vote
            if (voteID == -1) {
                team1_novote_number++;
                console.log("no vote for 1");
            } else {
                team1_votes[voteID]++;
                console.log("vote counted 1-" + voteID);
            }
            //if all votes are in
            if (team1_vote_number == team1.length) {
                console.log("all votes are in for 1!");
                submitVote(teamID);
            }
        } else {
            team2_vote_number++;
            //what to do with no vote
            if (voteID == -1) {
                team2_novote_number++;
                console.log("no vote for 2");
            } else {
                team2_votes[voteID]++;
                console.log("vote counted 2-" + voteID);
            }
            //if all votes are in
            if (team2_vote_number == team2.length) {
                console.log("all votes are in for 2!");
                submitVote(teamID);
            }
        }




    });



    function submitVote(teamID) {
        if (teamID == 0) {
            if (team1_vote_number - team1_novote_number < 2) {
                //not enough votes to submit
                console.log("not enought from team 1 to continue");
                finalVoteID = -1;
            } else {
                var tempVote = 0;
                var tempVoteIndex = 0;
                var tie = false;
                team1_votes.forEach(function (item, index) {
                    if (item > tempVote) {
                        tempVote = item;
                        finalVoteID = index;
                        tie = false;
                    } else if (item == tempVote) {
                        tie = true;
                        finalVoteID = -1;
                    }
                });
                //reset
                team1_votes = [0, 0, 0, 0];
                team1_vote_number = 0;
                team1_vote_number = 0;
            }
        } else {
            if (team2_vote_number - team2_novote_number < 2) {
                //not enough votes to submit
                console.log("not enought from team 2 to continue");
                finalVoteID = -1;
            } else {
                var tempVote = 0;
                var tempVoteIndex = 0;
                var tie = false;
                team2_votes.forEach(function (item, index) {
                    if (item > tempVote) {
                        tempVote = item;
                        finalVoteID = index;
                        tie = false;
                    } else if (item == tempVote) {
                        tie = true;
                        finalVoteID = -1;
                    }
                });
                //reset
                team2_votes = [0, 0, 0, 0];
                team2_vote_number = 0;
                team2_vote_number = 0;
            }
        }
        console.log("vote result = " + teamID + "-" + finalVoteID);
        io.emit('vote result', teamID, finalVoteID);
    }
});









/*
io.on('connection', function (socket) {
    console.log('a user connected');

    getMessages(20, function (messages) {
        messages.reverse().forEach(function (message, index) {
            socket.emit('chat message', message);
        });
    });

    io.emit('chat message', '**A new user has connected**');
    socket.on('disconnect', function () {
        io.emit('chat message', '**A user has left the chat**');
        console.log('user disconnected');
    });

    socket.on('chat message', function (msg) {
        console.log('message: ' + msg);
        saveMessage(msg);
        io.emit('chat message', msg);
    });


});
*/

app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});