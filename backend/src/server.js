import express from "express";
//using module instead of commonjs
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import http from "http";
const app = express();


app.get("/", (req, res)=>{
    res.status(200).json({msg: "api s up and running"})
}) 
//checking if server chl rha ya nhi

app.use(cors({
    origin: "*",
    methods: ["GET","PUT","POST","DELETE"],
    allowedHeaders: ["Content-Type","Authorization"]
}));

const server = http.createServer(app);



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