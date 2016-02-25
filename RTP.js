var rtpPacket = require('./RTPpacket'); // a helper module that maintains the RTP packetization process

var udp = require('dgram'); 
var sock; 					
var intervalIDs = {};

/* Streams file data to the client through a UDP socket */
function writeData (client, file) {
	if (!sock)
		sock = udp.createSocket('udp4');
		
	var packet;
	rtpPacket.generatePacket(packet, client, file, function(packet, error) { // Generate the rtp packet using the helper module for packetization
		if (!error) { // Send the packet through the UDP socket if there was no errors generating it
			sock.send(packet, 0, packet.length, client.clientPort, client.address, function(err, bytes) {
				if(err) {
					console.log(err);
					
					if(intervalIDs[client.session]) { // Discontinue the timer if there was an error sending the packet
						clearInterval(intervalIDs[client.session]);
						delete intervalIDs[client.session];
					}
				}
			});
		}
		else { // Discontinue the timer if there was an error generating the packet
			if(intervalIDs[client.session]) {
				clearInterval(intervalIDs[client.session]);
				delete intervalIDs[client.session];
			}
		}
	});
}

/* Handles the RTSP command PLAY - starts a timer that triggers the writeData function every 100ms */
this.play = function (client, file) {
	if(!intervalIDs[client.session])
		intervalIDs[client.session] = setInterval(function() { writeData(client,file); }, 100); // Start a timer to begin sending packets
}

/* Handles the RTSP command PAUSE - clears the timer */
this.pause = function (client) {
	if(intervalIDs[client.session]) {
		clearInterval(intervalIDs[client.session]); // Clear the timer to stop sending packets
		delete intervalIDs[client.session];
	}
}

/* Handles the RTSP command TEARDOWN - clears the timer and calls a callback function */
this.teardown = function (client, callback) {
	if(intervalIDs[client.session]) {
		clearInterval(intervalIDs[client.session]); // Clear the timer to stop sending packets
		delete intervalIDs[client.session];
	}
	if (callback && typeof(callback) === "function")
		callback(); // Call the callback, indicating that the timer was successfully cleared
}