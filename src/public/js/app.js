const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nickname");

const socket = new WebSocket(`wss://${window.location.host}`);

function makeMessage(type, payload){
	const msg = {type, payload};
	return JSON.stringify(msg);
}

socket.addEventListener("open", ()=>{
	console.log("connected to browser");
});

socket.addEventListener("message", (message)=>{
	const li = document.createElement("li");
	li.innerText = message.data;
	messageList.append(li);
});

socket.addEventListener("close", ()=>{
	console.log("closed");
});

function handleSubmit(event){
	event.preventDefault();
	const input = messageForm.querySelector("input");
	socket.send(makeMessage("message", input.value));
	input.value = "";
}

function nickSetting(event){
	event.preventDefault();
	const input = nickForm.querySelector("input");
	socket.send(makeMessage("nickname", input.value));
	input.value = "";
	document.getElementById("nickname").style.display = "none";
	document.getElementById("message").style.display = "block";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", nickSetting);