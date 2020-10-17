const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000;
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require('peer'); // baru

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room, portBaru: PORT }) // nambah portBaru
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(PORT, () => {
    console.log(`listening to request on port ${PORT}`)
})

/* BARU */

// peerjs
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use('/', peerServer);

// listeners
peerServer.on('connection', (client) => {
    console.log("Server: Peer connected with ID:", client.id);
});

peerServer.on('disconnect', (client) => {
    console.log("Server: Peer disconnected with ID:", client.id);
});
