# Introduction

This was projected was an assignment for a Computer Networks Applications course.


# Application Components

This application includes:
 - a main server file (server.js)
 - an RTSP module (RTSP.js)
 - an RTP module (RTP.js)
 - an RTP packetization helper module (RTPpacket.js)

It is designed to work with the provided video player (VideoPlayer.exe) and the video files (video1.mjpeg, video2.mjpeg).

This application is a Node.js streaming video server that communicates with one or more of the given video players 
using the Real-Time Streaming Protocol (RTSP) and sends data using the Real-time Transfer Protocol (RTP).


# Installation

 - First, ensure that you have node.js downloaded and installed on your machine. You can find it here: http://nodejs.org/
 - Next, simply unzip the folder and open the directory.
 - Normally you would need to type "npm install" into Command Prompt in the directory but I used only built-in node.js modules so this is not required.
 - When you want to run the application, ensure that you place the video files in the same directory!


# Usage

 - When using the server, ensure that you've placed the video files in the application directory.
 - To start the server, open Command Prompt and navigate to the application directory.
 - Frome here, type "node server.js" to start the server. You should see a "server is listening" prompt.
 - The server is now running! The server can be terminated by pressing CTRL+C.

 - From here, you can open up one or more of the given video players to test the server's functionality.
 - Feel free to click Connect, Setup, Play, Pause, and Teardown to observe how the server responds.

 - If you would like to change the IP address/port number that the server is listening on, you can do so in the server.js file.