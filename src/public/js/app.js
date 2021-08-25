const ul = document.querySelector("ul");
const messageForm = document.querySelector("form");

const socket = new WebSocket(`wss://${window.location.host}`);

socket.addEventListener("open", ()=>{
	console.log("connected to browser");
});

socket.addEventListener("message", (message)=>{
	console.log("message : ", message.data);
});

socket.addEventListener("close", ()=>{
	console.log("closed");
});

function handleSubmit(event){
	event.preventDefault();
	const input = messageForm.querySelector("input");
	socket.send(input.value);
	input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);