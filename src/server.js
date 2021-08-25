import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from 'ws';

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res)=> res.redirect("/"));

const handleListen = () => console.log(`Listening`);

const server = http.createServer(app);
const wss = new WebSocketServer({server});

const sockets = [];

wss.on("connection", (socket) => {
	sockets.push(socket);
	console.log("connected to server");
	
	socket.on("close", ()=>{
		console.log("disconnected");
	});
	
	socket.on("message", (message)=>{
		message = JSON.parse(message);
		if(message.type == "nickname"){
			socket.nickname = message.payload;
			console.log(socket.nickname);
		}
		else{
			var displayMsg = socket.nickname + " : " + message.payload;
			sockets.forEach((aSocket) => {
				aSocket.send(displayMsg);
			});
		}
	});
});

server.listen(3000, handleListen);