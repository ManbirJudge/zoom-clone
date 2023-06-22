import { v4 as uuidv4 } from 'uuid'
import { ExpressPeerServer as PeerServer } from 'peer'
import express from 'express'
import { Server as HttpServer } from 'http'
import { Server as IoServer } from 'socket.io'

// configuration
const app = express();
const server = HttpServer(app);
const io = new IoServer(server);
const peerServer = PeerServer(server, {
    debug: true,
});

// configuring app
app.set('view engine', 'ejs')
app.use(express.static('public'))
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
    console.log('New IO connection.')

    socket.on('join-room', (roomId, userId, userName) => {
        console.log(`A connection joined a room - ${userName} [${userId}].`)

        socket.join(roomId);
        socket.to(roomId).emit('user-joined', userId, userName);

        socket.on('message', message => {
            console.log(`${userId} ${message}`)

            io.to(roomId).emit('user-messaged', message, userId);
        });
    });
});

// starting the server
server.listen(process.env.PORT || 3030);