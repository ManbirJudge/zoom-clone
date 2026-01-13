import { v4 as uuidv4 } from "uuid";
import { Server as HttpServer } from "http";
import express from "express";
import expressLayouts from "express-ejs-layouts";
import { Server as IoServer } from "socket.io";
import { ExpressPeerServer } from "peer";

const app = express();
const server = HttpServer(app);
const ioServer = new IoServer(server);
const peerServer = ExpressPeerServer(server, { debug: true });

const port = process.env.PORT || 8080;

// express
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);

app.get("/", (req, res) => {
    res.render("index", { title: "Zoom Clone", nextRoomId: uuidv4() });
});

app.get("/about", (req, res) => {
    res.render("about", { title: "About - Zoom Clone", nextRoomId: uuidv4() });
});

app.get("/room/:room", (req, res) => {
    res.render("room", { roomId: req.params.room, layout: false });
});

// socket.io
ioServer.on("connection", socket => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-joined", userId, userName);

        socket.on("message", msg => {
            ioServer.to(roomId).emit("user-messaged", msg, userId);
        });
    });
});

// peerjs
app.use("/peerjs", peerServer);

// starting
server.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});