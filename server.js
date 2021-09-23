const path = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV === "production"
    ? path.resolve(process.cwd(), '.env.production') 
    : path.resolve(process.cwd(), '.env.development')
});
console.log('required dotenv')
require('./models/database');
require('express-async-errors');
const express = require('express')
const next = require('next')
const { v4: uuidv4 } = require('uuid');
const {ExpressPeerServer} = require('peer');
const bodyParser = require('body-parser');
const Room = require('./models/room');

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

async function main() {
  await nextApp.prepare();
  const app = express();
  app.enable('trust proxy');

  const server = app.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })

  const peerServer = ExpressPeerServer(server, {
    debug: true,
  });
  app.use('/peerjs', peerServer);

  app.post('/join', bodyParser.json(), async (req, res) => {
    const { roomId, clientId } = req.body;
    console.log('joining room', roomId, clientId);
    if(!roomId)
      return res.status(400).json({ error: "no room code provided"});
    // fetch the room object
    const room = await Room.findById(roomId);
    if(!room)
      return res.status(400).json({ error: "room not found"});
    if(room.currentMembers.find(m => m === clientId))
      return res.status(400).json({ error: "you're already in this room"});
    
    // add me to that room
    await Room.findOneAndUpdate({_id: roomId}, {
      $addToSet: { currentMembers: clientId }
    });
    return res.json(room.currentMembers);
  });

  app.post('/create', bodyParser.json(), async (req, res) => {
    console.log('creating room');
    const { clientId } = req.body;
    const room = await Room.create({
      currentMembers: []
    });
    return res.json(room._id);
  });

  app.post('/check', bodyParser.json(), async (req, res) => {
    const { roomId } = req.body;
    console.log('checking room', roomId);
    const room = await Room.findById(roomId);
    if(room) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  });

  peerServer.on('connection', (client) => {
    console.log("Server: Peer connected with ID:", client.id);
  });

  peerServer.on('disconnect', async (client) => {
    console.log("Server: Peer disconnected with ID:", client.id);
    await Room.updateMany({ currentMembers: { $elemMatch: { $eq: client.id} } }, {
      $pull: {currentMembers: client.id}
    });
  });

  app.use((err, req, res, next) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || err.toString() });
    }
    next(err);
  });

  // handle everything else with next.js
  app.all('*', (req, res) => {
    return handle(req, res)
  })
}

main();
