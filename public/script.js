// const { PeerServer } = require("peer");

const socket = io('/');

const videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;

var peer = new Peer(undefined, {
   path: '/peerjs' ,
   host: '/',
   port: '443'
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    
    peer.on('call', call => {
        call.answer(stream);

        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });

    // Messages Logic
    let text = $('input');

    $('html').keydown(e => {
        if (e.which == 13 && text.val().lenght !== 0) {
            socket.emit('message', text.val());
            text.val('');
        }
    });

    socket.on('create-message', message => {
        console.log('Some One Messaged:', message);

        $('.messages').append(`<li class='message'><b>User</b><br/>${message}</li>`);
        scrollToBottom();
    });
});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

// socket.on('user-connected', (userId) => {
//     connectToNewUser(userId, stream);
// });

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);

    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;

    // video.addEventListener('loadmetadata', () => {
        video.play();
    // });

    videoGrid.append(video);
};

const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop('scrollHeight'));
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if (enabled) {
        setUnmuteButton();
    } else {
        setMuteButton();
    }

    myVideoStream.getAudioTracks()[0].enabled = !enabled;
}

const startStopVideo = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
        setStartVideoButton();
    } else {
        setStopVideoButton();
    }

    myVideoStream.getVideoTracks()[0].enabled = !enabled;
}

const setMuteButton = () => {
    const html = 
    `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `;

    document.querySelector(".main__mute_button").innerHTML = html;
}

const setUnmuteButton = () => {
    const html = 
    `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `;

    document.querySelector(".main__mute_button").innerHTML = html;
}

const setStartVideoButton = () => {
    const html = 
    `
        <i class="fas fa-video-slash"></i>
        <span>Start Video</span>
    `;

    document.querySelector(".main__video_button").innerHTML = html;
}

const setStopVideoButton = () => {
    const html = 
    `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `;

    document.querySelector(".main__video_button").innerHTML = html;
}
