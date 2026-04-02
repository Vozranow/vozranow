import express from "express";
//using module instead of commonjs
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js"
import walletRoutes from "./routes/walletRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import listenerRoutes from "./routes/listenerRoutes.js"
import managerRoutes from "./routes/managerRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import path from "path";
import cookieParser from "cookie-parser";
import { initSocket } from "./socket/socketHandler.js";
import './workers/emailWorker.js';
import './cron/checker.js';
const __dirname = path.resolve();
const app = express();


app.get("/", (req, res)=>{
    res.status(200).json({msg: "api s up and running"})

}) 
//checking if server chl rha ya nhi

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174","http://172.28.208.1:5173","https://172.28.208.1:5174"], // 👈 exact frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // REQUIRED for cookies
  })
);


// app.set('trust proxy', 1);
app.use(express.json()); 
app.use(cookieParser());

app.use(
  "/public",
  express.static(path.join(__dirname, "src/public"))
);
// this whole folder can be accessed now in the server


app.use('/api/auth', authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/user",userRoutes);
app.use("/api/listener",listenerRoutes);
app.use("/api/manager",managerRoutes);
app.use("/api/admin",adminRoutes);

const server = http.createServer(app);
console.log(""); 
initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    //due to socket we need a http server to fall back on so we replace app.listen to server.listen
    server.listen(ENV.PORT, () => console.log("Server(rest + socket) is running on port:", ENV.PORT));
  } catch (error) {
    console.error("Error starting the server", error);
  }
};

startServer();