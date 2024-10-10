const express = require("express");
const cors = require("cors")
const db = require('./src/db/index')
const dotenv = require('dotenv')
const authRouter = require('./src/routes/authRoutes')
const userRouter = require('./src/routes/userRoutes')
const WebSocketServer  = require("./src/wsServer");

const app = express();

app.use(cors());

app.use(express.json())


dotenv.config({
    path: './.env'
})

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

const httpServer = app.listen(8000, () => {
    console.log("Server is running at port 8000");
})

//Initialize websocket server
const wsServer = new WebSocketServer(httpServer);


db.connectDB()
    .then(() => {
        console.log("Db connected successfully")
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })

