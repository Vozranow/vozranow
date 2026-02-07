import mongoose from "mongoose";
import User from "./models/users.js"; 
import ListenerProfile from "./models/listenerProfile.js"; // Import Profile model
import { connectDB } from "./lib/db.js";

// Make sure to connect first
await connectDB();

const importData = async () => {
  try {
    console.log("🔥 flushing old data...");
    
    // 1. Cleanup: Remove old Admins, Managers, and Listeners
    // We clean ListenerProfiles too so we don't leave orphans
    await User.deleteMany({ role: { $in: ["admin", "manager", "listener"] } });
    await ListenerProfile.deleteMany({});

    // 2. Create The Bosses 👔
    const staff = [
      {
        username: "SuperAdmin",
        email: "admin@solance.com",
        password: "adminpassword123",
        role: "admin",
        emailVerified: true,
      },
      {
        username: "HiringManager",
        email: "manager@solance.com",
        password: "managerpassword123",
        role: "manager",
        emailVerified: true,
      }
    ];

    for (const user of staff) {
      await User.create(user);
    }
    console.log("✅ Admin & Manager Created");

    // 3. Create 5 Test Listeners 🎧
    const listeners = [
      {
        name: "Dr. Sarah (Pro)",
        email: "sarah@test.com",
        online: true,
        days: ["Mon", "Wed", "Fri"],
        sessions: 150, // Experienced
        rating: 4.9,
        bio: "Clinical psychologist with 10 years of experience."
      },
      {
        name: "John Doe (Newbie)",
        email: "john@test.com",
        online: true,
        days: ["Mon", "Tue"],
        sessions: 1, // <3 Sessions -> Should show 'New 🐣'
        rating: 5.0,
        bio: "Good listener, here to help."
      },
      {
        name: "Emily Blunt (Busy)",
        email: "emily@test.com",
        online: false, // Offline
        days: ["Sat", "Sun"],
        sessions: 45,
        rating: 4.5,
        bio: "Specialist in anxiety and stress."
      },
      {
        name: "Rahul Gupta (Mid)",
        email: "rahul@test.com",
        online: true,
        days: ["Mon", "Thu"],
        sessions: 12,
        rating: 3.8, // Lower rating to test sorting
        bio: "Empathetic listener for students."
      },
      {
        name: "Lisa Ray (Always Open)",
        email: "lisa@test.com",
        online: true,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        sessions: 300,
        rating: 4.8,
        bio: "Available 24/7 for urgent care."
      }
    ];

    for (const l of listeners) {
      // A. Create User Account
      const user = await User.create({
        username: l.name,
        email: l.email,
        password: "password123", // Same password for all for easy testing
        role: "listener",
        emailVerified: true,
      });

      // B. Create Linked Profile
      await ListenerProfile.create({
        userId: user._id,
        isOnline: l.online,
        preferredDays: l.days,
        totalSessionsCompleted: l.sessions,
        totalEarnings: l.sessions * 150, // Fake earnings
        bio: l.bio,
        rating: {
          average: l.rating,
          count: l.sessions > 0 ? 10 : 1 // Fake count
        }
      });
    }

    console.log("✅ 5 Test Listeners Imported!");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

importData();