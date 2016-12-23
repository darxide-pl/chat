var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
/*var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'seriale4'
});

connection.connect();
 
connection.query('SELECT * FROM seriale', function(err, rows, fields) {
    if (err) throw err; 
    console.log(fields)
});*/
 

app.get('/', function(req, res){
  	res.sendfile('index.html');
});

var users = {}
var clients = {}

io.on('connection', function(socket){
  	socket.on('disconnect', function(){
  		if(typeof users[clients[socket.id]] !== 'undefined') {
	  		io.emit('leave_msg' , clients[socket.id])
	    	delete users[clients[socket.id]]
	    	delete clients[socket.id]
	  		io.emit('users' , JSON.stringify(users))  			
  		}
	});  	
		
  	socket.on('login' , function(user) {
  		if(typeof users[user] === 'undefined') {
  			users[user] = '1'
  			clients[socket.id] = user
  			socket.emit('login' , '1')
	  		io.emit('users' , JSON.stringify(users))
	  		io.emit('join_msg' , clients[socket.id])
  		} else {
  			socket.emit('login' , '0')
  		}
  	})

  	socket.on('msg' , function(msg) {
  		if(typeof clients[socket.id] !== 'undefined') {
  			var msg = JSON.parse(msg)
	  		var data = {}
	  		data.user = clients[socket.id]
	  		data.msg = msg 
	  		data.now = now()
	  		data.room = msg.room

  			if (msg.room != '0' && io.sockets.connected[clients.getKeyByValue(msg.room)]) {
    			io.sockets.connected[clients.getKeyByValue(msg.room)].emit('priv', JSON.stringify(data));
			} else {
	  			io.emit('msg' , JSON.stringify(data))  							
			}
  		}
  	})

  	socket.on('typing' , function() {
  		io.emit('typing' , clients[socket.id])
  	})
});

function now() {
	var date = new Date()
	var minutes = (date.getMinutes() < 10) ? '0'+date.getMinutes() : date.getMinutes()
	var seconds = (date.getSeconds() < 10) ? '0'+date.getSeconds() : date.getSeconds()

	return date.getHours() + ':' +  minutes + ':' + seconds
}

Object.prototype.getKeyByValue = function( value ) {
    for( var prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
             if( this[ prop ] === value )
                 return prop;
        }
    }
}

http.listen(3000, function(){
  	console.log('listening on *:3000');
});