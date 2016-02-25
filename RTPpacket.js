var fs = require('fs');

/* 
 * Generates the RTP packet by creating the header, retrieving the payload size, retrieving the payload, 
 * and concatenating the header with the payload
 */
this.generatePacket = function(packet, client, file, callback) {
	
	// Generate the header

	var header = new Buffer(12);
	header[0] = 0x80; // V = 2, P = 0, X = 0, CC = 0
	header[1] = 0x1A; // M = 0, PT = 26

	header.writeUInt16BE(client.sequenceNumber,2); // Sequence number (1st is random, incremented by 1)
	client.sequenceNumber++;
	if (client.sequenceNumber >= Math.pow(2,16))
		client.sequenceNumber = 0;

	header.writeUInt32BE(client.timestamp,4); // Timestamp (1st is random, incremented by 100)
	client.timestamp+=100;
	if (client.timestamp >= Math.pow(2,32))
		client.timestamp = 0;

	header[8] = 0x12; // Source Identifier (SSRC) = any integer value you like
	header[9] = 0x34; //
	header[10] = 0x56; //
	header[11] = 0x78; //

	// Extract the filepath from the protocol URL
	var filePath = file.replace(/.*:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]*\//g, ""); 
	
	var payload;
	var payloadSize;

	getPayloadSize(payloadSize, filePath, client, function(payloadSize, error){ // Retrieve the payload size
		if (!error){ // No error
			payload = new Buffer(payloadSize);

			getPayload(payload, filePath, client, function(payload, error){ // Retrieve the payload
				if (!error) { // No error
					packet = new Buffer(header.length + payload.length); 
					var buffList = new Array();
					buffList[0] = header;
					buffList[1] = payload;
					packet = Buffer.concat(buffList,buffList[0].length + buffList[1].length); // Concatenate the header and payload to form the RTP packet
				}
				if (callback && typeof(callback) === "function")
					callback(packet, error); // pass the results (the packet and any error) to the callback
			});
		}
		else { // Error
			if (callback && typeof(callback) === "function")
				callback(packet, error); // pass the results (the error) to the callback
		}		
	}); 
}

/* Reads the file from the last position to retrieve the size of the payload (ie. the size of the next frame) */
function getPayloadSize(payloadSize, filePath, client, callback) {
	try {
		fs.open(filePath, 'r', function(err, fd) { // Open the file at the specified path
			if (!err) {
			
				var frameSize = new Buffer(5);
				try {
					fs.read(fd, frameSize, 0, frameSize.length, client.fPosition, function(err, bytesRead, buffer) { // Read the 5 byte frame header to deterimine the frame size
						client.fPosition += bytesRead; // Update the file position
						fs.close(fd);

						if (!err) {
							payloadSize = parseInt(frameSize,10); // Parse the 5 byte frame header into an integer to get the frame payload size
						}
						else				
							console.log(err);
						if (callback && typeof(callback) === "function") 
							callback(payloadSize, err); // pass the results (the payload size and any error) to the callback

					});
				}
				catch (e) { // Catch and pass exceptions to the callback
					if (callback && typeof(callback) === "function")
						callback(payloadSize, e);
				}	
			}
			else {
				console.log(err);
				if (callback && typeof(callback) === "function")
					callback(0, err); // Pass errors to the callback
			}
		});
	}	
	catch (e) { // Catch and pass exceptions to the callback
		if (callback && typeof(callback) === "function")
			callback(payload, e);
	}
}


/* Reads the file from the last position to retrieve the payload (a single frame) */
function getPayload(payload, filePath, client, callback) {
	try {
		fs.open(filePath, 'r', function(err, fd) {
			if (!err) {
				try {
					fs.read(fd, payload, 0, payload.length, client.fPosition, function(err, bytesRead, buffer) { // Read the frame payload
						client.fPosition += bytesRead; // Update the file position
						fs.close(fd);

						if (callback && typeof(callback) === "function")
							callback(payload, err); // pass the results to the callback
					});		
				}
				catch (e) { // Catch and pass exceptions to the callback
					if (callback && typeof(callback) === "function")
						callback(payload, e);
				}	
			}
			else { 
				console.log(err);
				if (callback && typeof(callback) === "function")
					callback(0, err); // Pass errors to the callback
			}

		});
	}
	catch (e) { // Catch and pass exceptions to the callback
		if (callback && typeof(callback) === "function")
			callback(payload, e);
	}
}