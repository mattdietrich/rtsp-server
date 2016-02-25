var net = require('net');
var rtsp = require('./RTSP');

var HOST = '127.0.0.1';
var PORT = 3000;

var server = net.createServer();
server.listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

/* New connection event handler */
server.on('connection', function(sock) {
		rtsp.handleClientJoining(sock); // called for each client joining
	}
);