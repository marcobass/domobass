var exec = require("child_process").exec;
var gpio = require('rpi-gpio');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function (req, res) {
	  res.sendfile(__dirname + '/index.html');
});

app.use(express.static('public'));

gpio.on('change', function(channel, value){
	console.log("pin : " + channel + ", etat : " + value);
	if(value==1){
		io.emit('message' + channel,'lumiere allumee');
	}else{
		io.emit('message' + channel,'lumiere eteinte');
	}
});
gpio.setup(11, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(13, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(7, gpio.DIR_IN, gpio.EDGE_BOTH);


function lectureEtatLampe(lampe){
	exec("gpio -1 mode " + lampe + " out");
	exec("gpio -1 read " + lampe,(error, stdout, stderr)=>{
		if(error){
			console.error('exec error: ${error}');
			return;
		}
		if(stdout==1){
			io.emit('message' + lampe,'lumiere allumee');
		}else{
			io.emit('message' + lampe,'lumiere eteinte');
		}

	});
};

io.sockets.on('connection',function(socket){

	lectureEtatLampe(7);
	lectureEtatLampe(11);
	lectureEtatLampe(13);

	console.log('client connecté');
	
	socket.on('disconnect',function(){
		console.log('client deconnecte');
	});
	
	
	socket.on('interChambre1',function(message){
		exec("gpio toggle 7");
	})
	
	socket.on('interChambre2',function(message){
		exec("gpio toggle 0");
	});
	
	socket.on('interChambre3',function(message){
		exec("gpio toggle 2");
	});
});

server.listen(1609);
