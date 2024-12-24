const WebSocket = require('ws');
const User = require("./models/userModels");
const {RedisQueueManager} = require("./db/redisQueueManager");
const {ChatManager} = require("./chatManager");
const {Matchmaker} = require("./matchMaker");
const { parse } = require('dotenv');

class WebSocketServer {
    constructor(httpServer) {
        this.wss = new WebSocket.Server({ server: httpServer });
        this.initialize();
        this.queueManager = new RedisQueueManager();
        this.chatManager = new ChatManager(this);
        this.matchMaker = new Matchmaker(this.queueManager, this.chatManager);
    }

    initialize() {
        console.log("WebSocketServer initialized");
        this.wss.on('connection', async (ws, req) => {
            ws.on('error', console.error);
            ws.send('Connected to websocket server');
            try {
                const userId = req.headers.userid;
                ws.userId = userId;
                const gender = await this.getUserGender(userId);

                //todo - check if the user is already in the queue
                this.queueManager.addToQueue(gender, userId);
                ws.send('User added to queue');
                this.matchMaker.matchUsers();
                ws.on('message', (message)=>this.handleMessage(ws, message));
            } catch (err) {
                console.error(err);
                ws.send('Something went wrong');
            }
        });
    }

    async getUserGender(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user.gender;
    }

    handleMessage(ws, message) {
        try {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage);
            console.log(parsedMessage.content);
            if (parsedMessage.type === 'chat_message') {
                const { roomId, content } = parsedMessage;
                // Verify that the sender is part of the room
                const room = this.chatManager.activeChats[roomId];
                if (room && (room.maleId === ws.userId || room.femaleId === ws.userId)) {
                    this.chatManager.broadcastMessage(roomId, ws.userId, parsedMessage.content);
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'You are not in this room' }));
                }
            }
        } catch (err) {
            console.error('Error handling message:', err);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    }
}

module.exports = WebSocketServer;
