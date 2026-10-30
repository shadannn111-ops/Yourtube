import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { createServer } from "http"; // ✅ HTTP Server
import { Server } from "socket.io"; // ✅ Socket.io
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import subscriptionroutes from "./routes/subscription.js";
import downloadroutes from "./routes/download.js";
import adminroutes from "./routes/admin.js";
import subscriberoutes from "./routes/subscribe.js";
import meetingroutes from "./routes/meeting.js";

dotenv.config();
const app = express();

// ✅ HTTP Server for Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// ✅ Socket.io Signaling Logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", payload);
  });

  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", payload);
  });

  socket.on("ice-candidate", (incoming) => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], credentials: true }));
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("You tube backend is working"));

app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/subscription", subscriptionroutes);
app.use("/download", downloadroutes);
app.use("/admin", adminroutes);
app.use("/subscribe", subscriberoutes);
app.use("/meeting", meetingroutes);

const PORT = process.env.PORT || 5000;
// ✅ httpServer listen karo, app nahi
httpServer.listen(PORT, () => { console.log(`server running on port ${PORT}`); });

const DBURL = process.env.DB_URL;
mongoose.connect(DBURL).then(() => { console.log("Mongodb connected"); }).catch((error) => { console.log(error); });
