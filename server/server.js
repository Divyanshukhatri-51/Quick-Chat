import dotenv from "dotenv"
dotenv.config();
import express from "express"
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3000;
// console.log(process.env.JWT_SECRET);

//create express app and http server
const app = express();
const server = http.createServer(app);

//Initialise socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
});

//store online users
export const userSocketMap = {}; // { userId: socketId }

//socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    //emit online users to all connected clients
    io.emit("online-users", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("online-users", Object.keys(userSocketMap));
    })
})

//middleware
app.use(express.json({ limit: '4mb' }));
app.use(cors());

app.use("api/status", (req, res) => {
    res.send("server is live");
})

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

//connect to database
await connectDB();

if(process.env.NODE_ENV !== "production"){
server.listen(PORT, () => {
    console.log("server is running on port: ", PORT);
})
}
//export server for vercel
export default server;