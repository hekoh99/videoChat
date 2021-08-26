const socket = io();

const room = document.getElementById("chat");
const roomPage = document.getElementById("rooms");
const roomForm = roomPage.querySelector("#room");
const nickForm = document.querySelector("#nickname");
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
	socket.emit("room", {payload : roomName}, (members)=>{
		roomPage.style.display = "none";
		room.style.display = "block";
		const h3 = room.querySelector("h3");
		h3.innerText = `Room : ${roomName}`;
		const numPlace = room.querySelector("#members");
		numPlace.innerText = `참여 인원 : ${members}`;
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
		roomPage.style.display = "block";
		const name = document.createElement("h4");
		name.innerText = nick;
		document.querySelector("#name").appendChild(name);
	});
	input.value = "";
}

roomForm.addEventListener("submit", handleRoomSubmit);
chatForm.addEventListener("submit", handleChatSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

socket.on("roomLeft", (nickname, members)=>{
	const numPlace = room.querySelector("#members");
	numPlace.innerText = `참여 인원 : ${members}`;
	addMessage(`${nickname}님이 나갔습니다`);
});

socket.on("chat", (msg, nickname) =>{
	addMessage(`${nickname} : ${msg}`);
});

socket.on("roomEnter", (members)=>{
	const numPlace = room.querySelector("#members");
	numPlace.innerText = `참여 인원 : ${members}`;
});

socket.on("roomList", (rooms)=>{
	const list = document.querySelector("#roomList");
	list.innerHTML = "";
	rooms.forEach(room => {
		const roomBtn = document.createElement("button");
		roomBtn.innerHTML = room;
		list.appendChild(roomBtn);
	});
});