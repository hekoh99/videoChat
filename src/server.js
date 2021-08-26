import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res)=> res.redirect("/"));

const handleListen = () => console.log(`Listening`);

const server = http.createServer(app);
const io = SocketIO(server);

io.on("connection", socket => {
	socket.on("room", (msg, done)=>{
		const roomName = msg.payload;
		socket.join(roomName);
		done();
	});
	
	socket.on("disconnecting", ()=>{
		socket.rooms.forEach((room) => socket.to(room).emit("roomLeft"));
	});
	
	socket.on("chat", (msg, room, done) =>{
		socket.to(room).emit("chat", msg);
		done();
	});
});

server.listen(3000, handleListen);