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

setTimeout(()=>{
	socket.send("hello from the user");
}, 3000);