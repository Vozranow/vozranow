import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../lib/r2.js";
import { ENV } from "../lib/env.js";
import Session from "../models/session.js";

export const generatePresignedUrl = async (req, res) => {
  try {
    const { sessionId, fileType } = req.body;
    const userId = req.user._id.toString();

    // 1. Security Check: Is this user the Listener for this session?
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    
    // Only the Listener (or Admin) should upload recordings
    if (session.listenerId?.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to upload for this session" });
    }

    // 2. Create a Unique File Name
    // Structure: recordings/{sessionId}/{timestamp}.webm
    const timestamp = Date.now();
    const extension = fileType.split('/')[1] || 'webm'; 
    const key = `recordings/${sessionId}/${timestamp}.${extension}`;

    // 3. Generate the Pre-Signed URL
    const command = new PutObjectCommand({
      Bucket: ENV.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType, // e.g., 'video/webm'
    });

    // Link expires in 1 hour (3600 seconds)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    // 4. Send back to Frontend
    res.status(200).json({
      uploadUrl, // The magic link to PUT the file to
      key,       // The path where it will be saved (to save in DB later)
      publicUrl: `${ENV.R2_PUBLIC_URL}/${key}` // The final viewing link
    });

  } catch (err) {
    console.error("R2 Presigned URL Error:", err);
    res.status(500).json({ message: "Failed to generate upload link" });
  }
};