var rtp = require('./RTP'); // Maintains packet transmission

var currentSession;
var clients = {};

/* 
 * This function is called for each new client that joins. 
 * It logs the new connection and contains the event listener for data.
 * When the server receives an RTSP message, it responds on the same connection. 
 */
this.handleClientJoining = function(sock) {
	console.log('\nClient ' + sock.remoteAddress +':'+ sock.remotePort + ' is connected');

	sock.on('data', function(data) { // Data event handler
		console.log('\nClient ' + sock.remoteAddress + ':' + sock.remotePort + ' request:\n' + data); // Log the message

		var res = parseMessage(sock, data); // Parse the message to generate an RTSP response

		sock.write('RTSP/1.0 200 OK\r\nCSeq: ' + res.cSeq + '\r\nSession: '+ res.session + '\r\n'); // Send the RTSP response
	});
}

/* 
 * Parses the message that is received from the client and generates the components of the RTSP response.
 * This function also logs information about clients who have setup a connection and triggers the RTP module to handle each command.
 */
function parseMessage (socket, message) {

	// Begin parsing the message using string manipulation (typically faster than regular expressions)

	var msgLines = message.toString().split('\r\n');

	var numLines = msgLines.length;
	var lineItems = new Array(numLines);
	for (var i = 0; i < numLines; i++)
		lineItems[i] = msgLines[i].split(' ');
	
	var cmd = lineItems[0][0],
		file = lineItems[0][1],
		cSeq = lineItems[1][1],
		session = lineItems[2][1],
		clientPort = lineItems[2][3];

	session = msgLines[2].replace(/Session:\s*/g, ""); // Retreive the session number
	
	if (cmd == 'SETUP') {
		if (!currentSession) // The first session
			session = currentSession = generateFirstSessionID();
		else { // All subsequent sessions
			currentSession++;
			if (currentSession >= Math.pow(2,32))
				currentSession = 0;
			session = currentSession;
		} 
		// Store information on the client to maintain the session
		clients[currentSession] = new Client(currentSession, socket.remoteAddress, socket.remotePort, clientPort);
	}		
	else if (cmd == 'PLAY')
		rtp.play(clients[session], file); // Call the RTP play function
	else if (cmd == 'PAUSE')
		rtp.pause(clients[session]);	  // Call the RTP pause function
	else if (cmd == 'TEARDOWN') {
		rtp.teardown(clients[session], function() { // Call the RTP teardown function, and delete the client information in the callback
			delete clients[session];
		}); 
	}

	return new RTSPResponse(cSeq, session); // Return the RTSP response object that contains the CSeq & Session
}

/* This function generates the first session ID by taking a random number in the range 0 - 2^32 */
function generateFirstSessionID() {
	return Math.floor(Math.random()*(Math.pow(2,32)));
}

/* Constructor for an RTSPResponse object - contains the session number and the CSeq number */
function RTSPResponse(cSeq,session) {
	this.cSeq=cSeq;
	this.session=session;
}

/* Constructor for a Client object */
function Client (session, address, port, clientPort) {
	this.session = session;
	this.address = address;
	this.port = port;
	this.clientPort = clientPort;
	this.sequenceNumber = Math.floor(Math.random()*(Math.pow(2,16))); // Sequence number (1st is random, incremented by 1)
	this.timestamp = Math.floor(Math.random()*(Math.pow(2,32))); // Timestamp (1st is random, incremented by 100)
	this.fPosition = 0; // the initial file position
}