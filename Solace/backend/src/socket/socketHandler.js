import { Server } from "socket.io";
import { socketAuth } from "../middleware/socketAuth.js";
import { Message } from "../models/messageModel.js";
import Session from "../models/session.js";
import { ENV } from "../lib/env.js";
import redis from "../lib/redis.js";

let io;

// --------------------
// In-Memory Stores
// --------------------
const onlineUsers = new Map();        // Map<sessionId, Set<userId>>
const disconnectTimeouts = new Map(); // Map<userId, TimeoutID>

// --------------------
// Init Socket
// --------------------
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [ENV.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const username = socket.user.username;
    const role = socket.user.role;

    // ==========================
    // JOIN LOBBY
    // ==========================
    socket.on("join_lobby", async ({ sessionId }) => {
      socket.join(sessionId);
      socket.currentSessionId = sessionId;

      // ♻️ Cancel disconnect grace timer
      if (disconnectTimeouts.has(userId)) {
        clearTimeout(disconnectTimeouts.get(userId));
        disconnectTimeouts.delete(userId);
      }

      // 🟢 Presence tracking
      if (!onlineUsers.has(sessionId)) {
        onlineUsers.set(sessionId, new Set());
      }

      const roomUsers = onlineUsers.get(sessionId);
      const isNewJoin = !roomUsers.has(userId);
      roomUsers.add(userId);

      io.to(sessionId).emit("presence_update", {
        onlineUsers: Array.from(roomUsers),
      });

      // 🕒 Attendance (only first join)
      if (isNewJoin) {
        const session = await Session.findById(sessionId);

        if (session) {
          session.attendance = session.attendance || {};

          if (role === "user" && !session.attendance.userJoinedAt) {
            session.attendance.userJoinedAt = new Date();
          }

          if (role === "listener" && !session.attendance.listenerJoinedAt) {
            session.attendance.listenerJoinedAt = new Date();
          }

          await session.save();
        }

        // System message
        socket.to(sessionId).emit("receive_message", {
          _id: `temp_${Date.now()}`,
          type: "system",
          content: `${username} has joined the lobby`,
          createdAt: new Date(),
          senderId: { username: "System" },
          ephemeral: true,
        });
      }
    });

    // ==========================
    // SEND MESSAGE
    // ==========================
    socket.on("send_message", async ({ sessionId, content, type = "text" }) => {
      try {
        let finalType = type;

        if (type === "link") {
          const isGoogleMeet =
            content.includes("meet.google.com") ||
            content.includes("google.com/meet");

          if (!isGoogleMeet) finalType = "text";
        }

        const message = await Message.create({
          sessionId,
          senderId: userId,
          content,
          type: finalType,
        });

        await message.populate("senderId", "username role");
        

        const cleanMessage = {
          _id: message._id.toString(),
          sessionId: message.sessionId.toString(),
          content: message.content,
          type: message.type,
          createdAt: message.createdAt,
          senderId: {
            _id: message.senderId._id.toString(),
            username: message.senderId.username,
            role: message.senderId.role,
          },
        };

        if (finalType === "link") {
          await Session.findByIdAndUpdate(sessionId, {
            meetLink: content,
          });

          io.to(sessionId).emit("link_shared", { link: content });
        }

        io.to(sessionId).emit("receive_message", cleanMessage);
  
      } catch (err) {
        console.error("send_message error:", err);
      }
    });

    // ==========================
    // TYPING
    // ==========================
    socket.on("typing", ({ sessionId }) => {
      socket.to(sessionId).emit("user_typing", { user: username });
    });

    socket.on("stop_typing", ({ sessionId }) => {
      socket.to(sessionId).emit("user_stop_typing");
    });

    // ==========================
    // START SESSION (Listener)
    // ==========================
    // ==========================
    // START SESSION (Listener)
    // ==========================
    socket.on("start_session", async ({ sessionId }) => {
      if (role !== "listener") return;

      try {
        await Session.findByIdAndUpdate(sessionId, {
          status: "ongoing",
          startedAt: new Date(),
        });

        io.to(sessionId).emit("session_started", {
          startedAt: new Date(),
        });
      } catch (err) {
        console.error("Socket start_session error:", err);
      }
    });

    // ==========================
    // END SESSION (Listener)
    // ==========================
    socket.on("end_session", async ({ sessionId }) => {
      if (role !== "listener") return;

      try {
        // 1. Get the session to find the Client's ID
        const session = await Session.findById(sessionId).select("userId");
        
        // 2. Clear both the Listener's and the Client's caches!
        if (session) {
          await redis.del(`dashboard:${session.userId.toString()}`); // Clears Client's Cache
        }
        await redis.del(`dashboard:listener:${userId}`); // Clears Listener's Cache

        io.to(sessionId).emit("session_ended");
      } catch (err) {
        console.error("Socket end_session error:", err);
      }
    });

    // ==========================
    // MANUAL LEAVE
    // ==========================
    socket.on("leave_lobby", ({ sessionId }) => {
      handleUserLeft(sessionId, userId, username);
      socket.leave(sessionId);
      delete socket.currentSessionId;
    });

    // ==========================
    // DISCONNECT (Grace Period)
    // ==========================
    socket.on("disconnect", () => {
      const sessionId = socket.currentSessionId;
      if (!sessionId) return;

      const timeoutId = setTimeout(() => {
        handleUserLeft(sessionId, userId, username);
        disconnectTimeouts.delete(userId);
      }, 5000);

      disconnectTimeouts.set(userId, timeoutId);
    });
  });

  return io;
};

// --------------------
// Helper
// --------------------
const handleUserLeft = (sessionId, userId, username) => {
  if (!onlineUsers.has(sessionId)) return;

  const roomUsers = onlineUsers.get(sessionId);
  roomUsers.delete(userId);

  io.to(sessionId).emit("presence_update", {
    onlineUsers: Array.from(roomUsers),
  });

  io.to(sessionId).emit("receive_message", {
    _id: `temp_${Date.now()}`,
    type: "system",
    content: `${username} has left the lobby`,
    createdAt: new Date(),
    senderId: { username: "System" },
    ephemeral: true,
  });

  if (roomUsers.size === 0) {
    onlineUsers.delete(sessionId);
  }
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
