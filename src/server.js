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

server.listen(3000, handleListen);