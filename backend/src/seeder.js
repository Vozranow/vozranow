import mongoose from "mongoose";
import User from "./models/users.js"; 
import ListenerProfile from "./models/listenerProfile.js"; 
import Session from "./models/session.js"; // 👈 Updated to match your file name
import { connectDB } from "./lib/db.js";

const seed = async () => {
  try {
    // 1. Connect to DB
    await connectDB();
    console.log("🔥 Connected. Flushing old data...");

    // 2. Cleanup (Reset DB)
    await User.deleteMany({});
    await ListenerProfile.deleteMany({});
    await Session.deleteMany({});

    // 3. Create Staff (Admins) 👔
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

    // 4. Create Dummy Clients (Seekers) 👥
    const seekerNames = ["BlueSky99", "SilentRiver", "HopefulOwl", "VelvetThunder", "NeonWalker"];
    const seekerIds = [];

    for (const name of seekerNames) {
      const seeker = await User.create({
        username: name,
        email: `${name.toLowerCase()}@test.com`,
        password: "password123",
        role: "user",
        emailVerified: true,
        walletBalance: 5000
      });
      seekerIds.push(seeker._id);
    }
    console.log("✅ 5 Dummy Seekers Created");

    // 5. Define Listeners Data 🎧
    const listenersData = [
      {
        name: "Dr. Sarah (Pro)",
        email: "sarah@test.com",
        online: true,
        days: ["Mon", "Wed", "Fri"],
        sessions: 150,
        rating: 4.9,
        bio: "Clinical psychologist with 10 years of experience."
      },
      {
        name: "John Doe (Newbie)",
        email: "john@test.com",
        online: true,
        days: ["Mon", "Tue"],
        sessions: 1,
        rating: 5.0,
        bio: "Good listener, here to help."
      },
      {
        name: "Emily Blunt (Busy)",
        email: "emily@test.com",
        online: false,
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
        rating: 3.8,
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

    const randomReviews = [
      "Truly helpful session.", "I felt heard for the first time.", 
      "Connection was okay, but advice was great.", "Very patient listener.", 
      "Helped me clear my mind.", "Life changing conversation.", "Highly recommended!"
    ];

    // Helper: Random date in past 30 days
    const getRandomDate = () => {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 30));
      d.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM - 8 PM
      return d;
    };

    // 6. Loop Listeners -> Create Profile -> Create 5 Completed Sessions
    for (const l of listenersData) {
      
      // A. Create User
      const user = await User.create({
        username: l.name,
        email: l.email,
        password: "password123",
        role: "listener",
        emailVerified: true,
        walletBalance: 1000
      });

      // B. Create Profile
      await ListenerProfile.create({
        userId: user._id,
        isOnline: l.online,
        preferredDays: l.days,
        totalSessionsCompleted: l.sessions,
        totalEarnings: l.sessions * 400,
        bio: l.bio,
        rating: {
          average: l.rating,
          count: l.sessions > 0 ? 10 : 1
        }
      });

      // C. Create Session History
      const sessionDocs = [];
      for (let i = 0; i < 5; i++) {
        const randomSeekerId = seekerIds[Math.floor(Math.random() * seekerIds.length)];
        const date = getRandomDate();
        const endTime = new Date(date.getTime() + 60 * 60 * 1000); // 1 hr duration

        sessionDocs.push({
          userId: randomSeekerId,
          listenerId: user._id,
          assignedBy: user._id, // Self-assigned for mock data
          status: "completed",
          
          // Dates
          scheduledDate: date,
          preferredTimeStart: date,
          preferredTimeEnd: endTime,
          scheduledStartAt: date,
          startedAt: date,
          endedAt: endTime,
          
          // Stats
          bookedDurationMinutes: 60,
          actualDurationMinutes: 60,
          price: 500,
          
          // ✅ THE REVIEW (1-5 Rating)
          review: {
            // Round the listener's avg rating to get an integer (e.g., 4.9 -> 5)
            rating: Math.round(l.rating), 
            comment: randomReviews[Math.floor(Math.random() * randomReviews.length)],
            createdAt: endTime
          },
          
          timeline: [
            { status: "created", time: new Date(date.getTime() - 86400000), note: "Booked" },
            { status: "assigned", time: new Date(date.getTime() - 80000000), note: "Assigned" },
            { status: "completed", time: endTime, note: "Session finished" }
          ]
        });
      }
      
      await Session.insertMany(sessionDocs);
      console.log(`✅ Created: ${l.name} + 5 Sessions`);
    }

    console.log("✨ All Data Imported Successfully!");
    process.exit();

  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
};

seed();