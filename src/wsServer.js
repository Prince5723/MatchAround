const WebSocket = require('ws');

class WebSocketServer {
    constructor(httpServer) {
        this.wss = new WebSocket.Server({ server: httpServer });
        this.initialize();
    }
    initialize() {
        console.log("WebSocketServer initialized");
        this.wss.on('connection', function connection(ws) {
            ws.on('error', console.error);
            ws.send('Hello! Message From Server!!');
        });
    }

}

module.exports = WebSocketServer;





