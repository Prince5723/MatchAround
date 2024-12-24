class ChatManager {
    constructor(server) {
        this.server = server; // Reference to WebSocketServer
        this.activeChats = {}; // Store active chat rooms
    }

    createRoom(maleId, femaleId) {
        const roomId = `${maleId}_${femaleId}`;
        this.activeChats[roomId] = { maleId, femaleId, startTime: Date.now() };
        console.log(this.activeChats);

        // Notify both users
        this.notifyUsers(maleId, femaleId, roomId);

        // Set a 10-minute timer to close the chat
        this.setChatTimer(roomId);
        this.broadcastMessage(roomId, maleId, 'You have been matched. Start chatting!');
    }

    notifyUsers(maleId, femaleId, roomId) {
        // Notify users that the room is created and chat is starting
        this.server.wss.clients.forEach(client => {
            // Check if the WebSocket connection is open
            if (client.readyState === client.OPEN) {
                // Notify only the male and female users involved in the match
                if (client.userId === maleId || client.userId === femaleId) {
                    client.send(JSON.stringify({
                        type: 'chat_started',
                        roomId,
                        message: `You have been matched. Start chatting!`
                    }));
                }
            }
        });
    }
    

    setChatTimer(roomId) {
        // Set a 10-minute timer (600000ms)
        setTimeout(() => {
            this.endChat(roomId);
        }, 600000); // 10 minutes in milliseconds
    }

    broadcastMessage(roomId, senderId, message) {
        const { maleId, femaleId } = this.activeChats[roomId];
        console.log(maleId, femaleId);
        console.log(message);

        // Broadcast message to both users in the chat room
        this.server.wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                if (client.userId === maleId || client.userId === femaleId) {
                    client.send(JSON.stringify({
                        type: 'chat_message',
                        senderId,
                        roomId,
                        message
                    }));
                }
            }
        });
    }

    endChat(roomId) {
        // Notify users that the chat has ended
        const { maleId, femaleId } = this.activeChats[roomId];

        this.server.wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                if (client.userId === maleId || client.userId === femaleId) {
                    client.send(JSON.stringify({
                        type: 'chat_ended',
                        roomId,
                        message: 'The 10-minute chat session has ended.'
                    }));
                }
            }
        });

        // Remove the room from activeChats
        delete this.activeChats[roomId];
    }
}

module.exports = { ChatManager };
