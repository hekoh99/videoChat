const socket = io();

const myFace = document.getElementById("myFace");
const muteBtns = document.getElementsByClassName("mute");
const cameraBtns = document.getElementsByClassName("camera");
const camdirBtn = document.getElementById("camDir");

const peerStream = document.getElementById("peerStream");

const roomInfo = document.getElementById("roomInfo");
const roomForm = roomInfo.querySelector("form");
const chat = document.getElementById("chat");
 
chat.hidden = true;

let myStream;

let isMuted = false;
let isCamOff = false;
let camFront = true;
let myPeerConnection;

async function getMedia(){
	const videoConst = { facingMode: (camFront ? "user" : "environment") };
	try{
		myStream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: videoConst,
		});
		myFace.srcObject = myStream;
		myStream.getAudioTracks().forEach((track)=>{
			if(track.enabled){
				document.getElementById("myAud").innerText = "음소거";
			}else{
				document.getElementById("myAud").innerText = "음소거 해제"
			}
		});
		myStream.getVideoTracks().forEach((track)=>{
			if(track.enabled){
				document.getElementById("myCam").innerText = "카메라 끔"
			}
			else{
				document.getElementById("myCam").innerText = "카메라 켬";
			}
		});
	} catch(e){
		alert(e);
	}
}

async function joinRoomDone(members, roomName){
	roomInfo.hidden = true;
  	chat.hidden = false;
	const name = document.querySelector("#roomName");
  	name.innerText = `Room ${roomName}`;
	name.setAttribute("name", roomName);
	const numPlace = document.querySelector("#members");
	numPlace.innerText = `참여 인원 : ${members}`;
}

function handleMute(event){
	event.preventDefault();
	myStream.getAudioTracks().forEach((track)=>{
		track.enabled = !track.enabled
		if(track.enabled){
			event.path[0].innerText = "음소거";
		}else{
			event.path[0].innerText = "음소거 해제"
		}
	});
}

function handleCamera(event){
	event.preventDefault();
	myStream.getVideoTracks().forEach((track)=>{
		track.enabled = !track.enabled
		if(track.enabled){
			event.path[0].innerText = "카메라 끔"
		}
		else{
			event.path[0].innerText = "카메라 켬";
		}
	});
}

async function handleCamChange(event){
	event.preventDefault();
	camFront = !camFront;
	await getMedia();
	if(camFront) event.path[0].innerText = "후면 캠";
	else event.path[0].innerText = "전면 캠";
	
	if(myPeerConnection){
		const videoTrack = myStream.getVideoTracks()[0];
		const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind == "video" );
		videoSender.replaceTrack(videoTrack);
	}
}

async function handleRoomSubmit(event){
	event.preventDefault();
	const input = roomForm.querySelector("input");
	const roomName = input.value;
	await getMedia();
	makeConnection();
	socket.emit("joinRoom", roomName, (members, roomName)=>{
		joinRoomDone(members, roomName);
	});
	input.value = "";
}

function handleIce(data){
	const room = document.querySelector("#roomName");
	const name = room.getAttribute("name");
	socket.emit("ice", data.candidate, name);
}

function handleAddStream(data){
	const stream = data.stream;
	const peerFace = document.createElement("video");
	peerFace.setAttribute("id", stream.id);
	peerFace.setAttribute("width", "30%");
	peerFace.setAttribute("height", "30%");
	peerFace.autoplay = true;
	peerFace.srcObject = stream;
	peerStream.appendChild(peerFace);
}

// event listener

for (let btn of muteBtns) {
    btn.addEventListener("click", handleMute);
}
for (let btn of cameraBtns) {
    btn.addEventListener("click", handleCamera);
}
camdirBtn.addEventListener("click", handleCamChange);

roomForm.addEventListener("submit", handleRoomSubmit);

// socket code

socket.on("roomEnter", async (roomName, members)=>{  // peer A
	const numPlace = document.querySelector("#members");
	numPlace.innerText = `참여 인원 : ${members}`;
	const offer = await myPeerConnection.createOffer();
	myPeerConnection.setLocalDescription(offer);
	socket.emit("offer", offer, roomName);
});

socket.on("roomLeft", (members)=>{
	const numPlace = document.querySelector("#members");
	numPlace.innerText = `참여 인원 : ${members}`;
});

socket.on("offer", async (offer, roomName)=>{   // peer B receive offer
	myPeerConnection.setRemoteDescription(offer);
	const answer = await myPeerConnection.createAnswer();
	myPeerConnection.setLocalDescription(answer);
	socket.emit("answer", answer, roomName);
});

socket.on("answer", answer =>{  // peer A receive ans
	myPeerConnection.setRemoteDescription(answer);	
});

socket.on("ice", ice => {
	myPeerConnection.addIceCandidate(ice);
});

// RTC code

function makeConnection(){
	myPeerConnection = new RTCPeerConnection();
	myPeerConnection.addEventListener("icecandidate", handleIce);
	myPeerConnection.addEventListener("addstream", handleAddStream);
	myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}
