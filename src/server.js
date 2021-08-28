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

server.listen(3000, handleListen);