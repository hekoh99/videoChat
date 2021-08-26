const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const roomForm = welcome.querySelector("form");
const chatForm = room.querySelector("form");

let roomName = "";

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
		addMessage(`나 : ${msg}`);
	});
	input.value = "";
}

roomForm.addEventListener("submit", handleRoomSubmit);
chatForm.addEventListener("submit", handleChatSubmit);

socket.on("roomLeft", ()=>{
	addMessage("someone left");
});

socket.on("chat", addMessage);