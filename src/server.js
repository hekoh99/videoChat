import express from "express";
import http from "http";
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res)=> res.redirect("/"));

const handleListen = () => console.log(`Listening`);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(io, {
  auth: false
});

function publicRoom(){
	const {
		sockets:{
			adapter:{sids, rooms},
		},
	} = io;
	const publicRooms = [];
	rooms.forEach((_, key)=>{
		if(sids.get(key) === undefined){
			publicRooms.push(key);
		}
	});
	return publicRooms;
}

function countUser(roomName){
	if(io.sockets.adapter.rooms.get(roomName) != undefined){
		return io.sockets.adapter.rooms.get(roomName).size;
	}
	else return 0;
}

io.on("connection", socket => {
	io.sockets.emit("roomList", publicRoom());
	socket.on("room", (msg, done)=>{
		const roomName = msg.payload;
		socket.join(roomName);
		done(countUser(roomName));
		socket.to(roomName).emit("roomEnter", countUser(roomName));
		io.sockets.emit("roomList", publicRoom());
	});
	
	socket.on("disconnecting", ()=>{
		socket.rooms.forEach((room) => socket.to(room).emit("roomLeft", socket.nickname, countUser(room)-1));
	});
	
	socket.on("disconnect", ()=>{
		io.sockets.emit("roomList", publicRoom());
	});
	
	socket.on("chat", (msg, room, done) =>{
		socket.to(room).emit("chat", msg, socket.nickname);
		done();
	});
	
	socket.on("nickSet", (nick, done)=>{
		socket.nickname = nick;
		done();
	});
});

server.listen(3000, handleListen);