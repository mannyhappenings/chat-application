var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
//var db = require('mongodb');
var db = require('node-mysql');
var utilities = require('./utilities');
var clog = utilities.clog;
var users = {};
users.length = 0;

app.listen(8888);
utilities.clog(utilities.members(db));
var DB = db.DB;
var BaseRow = db.Row;
var BaseTable = db.Table;
var dbase = new DB({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'prod_clone'
});
clog(utilities.members(dbase));

function handler (req, res) {

	//console.log(req);
	if(req.url =='/')
		req.url = '/public/index.htm';
	else
		req.url = '/public' + req.url;
	// console.log(__dirname + req.url);
  	fs.readFile(__dirname + req.url,
  	function (err, data) {
	    if (err) {
	      res.writeHead(500);
	      return res.end('Error loading requested file, ' + req.url);
	    }

	    res.writeHead(200);
	    res.end(data);
	});
}

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		//console.log(data);
	});
	socket.on('getUser', function (){
		clog(socket.rooms);
	});
	socket.on('message', function (data){
		// console.log(utilities.members(io.sockets));
		//console.log(data);
		io.sockets.in(users[data.to]).emit('message', data);
	});
	socket.on('new user', function (data){
		clog(data);
		if(!users[data.username]) {
			console.log("Adding one user, " + data.username);
			users[data.username] = socket.id;
			users.length = users.length + 1;
			socket.broadcast.emit('new user alert', data);
			var userList = [];
			for(var x in users){
				if(typeof users[x]== 'string')
					userList.push(x);
			}
			socket.emit('user-list', userList);
//			clog("User added, " + data.username + "\nUsers currently: " + users.length);
			clog(users);
		} else {
			users[data.username] = socket.id;
			console.log(users);
			var userList = [];
			for(var x in users){
				if(typeof users[x]== 'string')
					userList.push(x);
			}
			socket.broadcast.emit('new user alert', data);
			socket.emit('user-list', userList);
		}
	});
	socket.on('dis-connect', function(data){
		console.log(data);
		if(!data.username){
			console.log("No user to disconnect, rather disconneting the socket.");
		} else {
			console.log("Disconnecting user, " + data.username);
			socket.broadcast.emit('dis-connect', data);
		}
		if(users[data.username]) {
			delete users[data.username];
			users.length--;
		}

		// console.log(io.sockets);
		socket.leave();
		// console.log(io.sockets);
		console.log(users);
	});
	socket.on('showSockets', function(){
		console.log(utilities.members(io.sockets.scokets));
	});
	socket.on('showConnected', function(){
		console.log(utilities.members(io.sockets.connected));
	});

});