const myFace = document.getElementById("myFace");
const muteBtns = document.getElementsByClassName("mute");
const cameraBtns = document.getElementsByClassName("camera");
const camdirBtn = document.getElementById("camDir");

let myStream;

let isMuted = false;
let isCamOff = false;
let camFront = true;

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

getMedia();

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
	getMedia();
	if(camFront) event.path[0].innerText = "후면 캠";
	else event.path[0].innerText = "전면 캠";
}

for (let btn of muteBtns) {
    btn.addEventListener("click", handleMute);
}
for (let btn of cameraBtns) {
    btn.addEventListener("click", handleCamera);
}

camdirBtn.addEventListener("click", handleCamChange);