import { Message } from "../models/messageModel.js";

// @desc    Get all messages for a specific session
// @route   GET /api/sessions/:sessionId/messages
export const getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 }) // Oldest first (like Discord/WhatsApp)
      .populate("senderId", "username role"); // Show who sent it

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};