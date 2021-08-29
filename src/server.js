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

function publicRoom(){ // roomList 만들 때 사용
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


io.on("connection", socket =>{
	socket.on("joinRoom", (roomName, done) =>{
		socket.join(roomName);
		done(countUser(roomName), roomName);
		socket.to(roomName).emit("roomEnter", roomName, countUser(roomName));
	});
	
	socket.on("disconnecting", ()=>{
		socket.rooms.forEach((room) => socket.to(room).emit("roomLeft", countUser(room)-1));
	});
	
	socket.on("offer", (offer, roomName)=>{
		socket.to(roomName).emit("offer", offer, roomName);
	});
	
	socket.on("answer", (ans, roomName)=>{
		socket.to(roomName).emit("answer", ans);
	});
	
	socket.on("ice", (ice, roomName)=>{
		socket.to(roomName).emit("ice", ice);
	});
	
});

server.listen(3000, handleListen);