import { v4 as uuidv4 } from 'uuid'
import { ExpressPeerServer } from 'peer'
import express from 'express'

// configuration
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

// configuring app
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer)

// routes configuration
app.get('/', (req, res) => {
    res.render('index', { nextRoomId: uuidv4() });
});
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

// socket io configuration
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('message', message => {
            io.to(roomId).emit('create-message', message);
        });
    });
});

// starting the server
server.listen(process.env.PORT || 3030);