// ---------------------------
const socket = io('/')
const peer = new Peer()

const users = {}

// ---------------------------
const joinConfirmDialog = document.getElementById('join-confirm-dialog')
const nameInputForJoin = document.querySelector('#name-input-for-join')
const joinBtn = document.getElementById('join-btn')
const videoGrid = document.getElementById('video-grid')
const currentUserVideo = document.createElement('video')

let currentUserVideoStream

currentUserVideo.muted = true

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    currentUserVideoStream = stream
});

// connection function
const addVideoStream = (video, stream, userName) => {
    video.srcObject = stream
    video.play()

    videoGrid.append(video)
};

// toggle functions
const toggleAudio = () => {
    const enabled = currentUserVideoStream.getAudioTracks()[0].enabled;

    if (enabled) {
        setMuteButton();
    } else {
        setUnmuteButton();
    }

    currentUserVideoStream.getAudioTracks()[0].enabled = !enabled;
}

const toggleVideo = () => {
    const enabled = currentUserVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
        setStartVideoButton();
    } else {
        setStopVideoButton();
    }

    currentUserVideoStream.getVideoTracks()[0].enabled = !enabled;
}

// ui update function
const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop('scrollHeight'));
};

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

// ---------------------------
let chatMessageInput = $('#chat-message-input');

chatMessageInput.keydown(e => {
    const message = chatMessageInput.val();
    if (e.which == 13 && message.lenght !== 0) {
        console.log(`Sent message: ${message}`)
        socket.emit('message', message);
        chatMessageInput.val('');
    }
});

// ---------------------------
socket.on('user-joined', (newUserId, newUserName) => {
    console.log(`A new user connected: ${newUserName} [${newUserId}].`)

    users[newUserId] = newUserName

    const newUserCall = peer.call(newUserId, currentUserVideoStream);
    const newUserVideo = document.createElement('video');

    newUserCall.on('stream', newUserVideoStream => {
        addVideoStream(newUserVideo, newUserVideoStream);
    });
});

socket.on('user-messaged', (message, userId) => {
    console.log(`${users[userId]} messaged: ${message}`);

    $('.messages').append(`<li class='message'><b>${users[userId]}</b><br/>${message}</li>`);
    scrollToBottom();
});

// ---------------------------
peer.on('open', userId => {
    joinConfirmDialog.showModal()

    joinBtn.addEventListener('click', e => {
        e.preventDefault()
        joinConfirmDialog.close();

        const nameForJoin = nameInputForJoin.value

        users[userId] = nameForJoin
        socket.emit('join-room', ROOM_ID, userId, nameForJoin);
        addVideoStream(currentUserVideo, currentUserVideoStream, nameForJoin)
    })
});
peer.on('call', otherUserCall => {
    otherUserCall.answer(currentUserVideoStream);
    const otherUserVideo = document.createElement('video');

    otherUserCall.on('stream', otherUserVideoStream => {
        addVideoStream(otherUserVideo, otherUserVideoStream);
    });
});
