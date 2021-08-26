const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("chat");
const roomForm = welcome.querySelector("#room");
const nickForm = welcome.querySelector("#nickname");
const chatForm = room.querySelector("form");

let roomName = "";
let nick = "";

function addMessage(msg){
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = msg;
	ul.appendChild(li);
}

function handleRoomSubmit(event){
	event.preventDefault();
	const input = roomForm.querySelector("input");
	roomName = input.value;
	socket.emit("room", {payload : roomName}, ()=>{
		welcome.style.display = "none";
		room.style.display = "block";
		const h3 = room.querySelector("h3");
		h3.innerText = `Room : ${roomName}`;
	});
	input.value = "";
}

function handleChatSubmit(event){
	event.preventDefault();
	const input = chatForm.querySelector("input");
	const msg = input.value;
	socket.emit("chat", msg, roomName, () => {
		addMessage(`나(${nick}) : ${msg}`);
	});
	input.value = "";
}

function handleNickSubmit(event){
	event.preventDefault();
	const input = nickForm.querySelector("input");
	nick = input.value;
	socket.emit("nickSet", nick, ()=>{
		nickForm.style.display = "none";
		roomForm.style.display = "block";
		const name = document.createElement("h4");
		name.innerText = nick;
		document.querySelector("#name").appendChild(name);
	});
	input.value = "";
}

roomForm.addEventListener("submit", handleRoomSubmit);
chatForm.addEventListener("submit", handleChatSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

socket.on("roomLeft", (nickname)=>{
	addMessage(`${nickname}님이 나갔습니다`);
});

socket.on("chat", (msg, nickname) =>{
	addMessage(`${nickname} : ${msg}`);
});