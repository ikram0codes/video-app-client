let ROOM_ID = prompt("Enter  Your name");
if (ROOM_ID === null) {
  ROOM_ID = prompt("Enter you Name");
} else {
  const socket = io("https://vide-app-backend.vercel.app");
  const videoGrid = document.getElementById("video-grid");
  const myPeer = new Peer();

  const myVideo = document.createElement("video");
  myVideo.muted = true;
  const peers = {};
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      addVideoStream(myVideo, stream);
      myPeer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      });
      socket.on("user-connected", (userId) => {
        console.log("F");
        connectToNewUser(userId, stream);
      });
    });

  socket.on("user-disconnected", (userId) => {
    if (peers[userId]) {
      peers[userId].close();
    }
  });

  myPeer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
  });

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");

    call.on("stream", (userVideoStream) => {
      console.log("w");
      addVideoStream(video, userVideoStream);
    });
    videoGrid.append(video);
    call.on("close", () => {
      video.remove();
    });

    peers[userId] = call;
  }

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    videoGrid.append(video);
  }
}
