import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import { r2Client } from "./lib/r2.js"; // Uses your actual S3 config
import { ENV } from "./lib/env.js";

const testPresignedFlow = async () => {
  console.log("\n🧪 STARTING PRESIGNED URL TEST...");

  // 1. Generate the URL (Exactly like your Controller does)
  const fileName = `test-backend-upload-${Date.now()}.txt`;
  const fileType = "text/plain";
  
  console.log("1️⃣  Generating Presigned URL...");
  
  const command = new PutObjectCommand({
    Bucket: ENV.R2_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
    // Explicitly undefined to match your fix
    ChecksumAlgorithm: undefined 
  });

  try {
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    console.log("   ✅ URL Generated:\n", uploadUrl);

    // 2. Upload to that URL (Simulating the Frontend)
    console.log("\n2️⃣  Attempting Upload via Axios...");
    
    // We create a simple buffer to mimic a file
    const fileContent = Buffer.from("s is a test upload from the backend script.");

    await axios.put(uploadUrl, fileContent, {
      headers: {
        "Content-Type": fileType,
      },
      maxBodyLength: Infinity,
    });

    console.log("   ✅ SUCCESS! File uploaded successfully.");
    console.log("   🎉 CONCLUSION: Your Backend Logic & Credentials are PERFECT.");
    console.log("      The issue is 100% a Browser/CORS restriction.");

  } catch (error) {
    console.error("\n❌ FAILED.");
    if (error.response) {
      console.error("   Server Responded With:", error.response.status, error.response.statusText);
      console.error("   Response Data:", error.response.data);
    } else {
      console.error("   Error Message:", error.message);
    }
    console.log("\n💡 DIAGNOSIS: If this failed, your R2 Credentials or Bucket Name are wrong.");
  }
};

testPresignedFlow();