import mongoose from "mongoose";
import User from "./models/users.js"; 
import ListenerProfile from "./models/listenerProfile.js"; 
import Session from "./models/session.js"; 
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
    console.log("Admin & Manager Created");

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
      { name: "Dr. Sarah (Pro)", email: "sarah@test.com", online: true, days: ["Mon", "Wed", "Fri"], sessions: 150, rating: 4.9, bio: "Clinical psychologist." },
      { name: "John Doe (Newbie)", email: "john@test.com", online: true, days: ["Mon", "Tue"], sessions: 10, rating: 5.0, bio: "Good listener." },
      { name: "Emily Blunt (Busy)", email: "emily@test.com", online: false, days: ["Sat", "Sun"], sessions: 45, rating: 4.5, bio: "Stress specialist." },
      { name: "Rahul Gupta (Mid)", email: "rahul@test.com", online: true, days: ["Mon", "Thu"], sessions: 12, rating: 3.8, bio: "Student empathetic listener." },
      { name: "Lisa Ray (Always Open)", email: "lisa@test.com", online: true, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], sessions: 300, rating: 4.8, bio: "Available 24/7." }
    ];

    const randomReviews = [
      "Truly helpful session.", "I felt heard for the first time.", 
      "Connection was okay, but advice was great.", "Very patient listener.", 
      "Highly recommended!"
    ];

    // 🟢 HELPER: Generate random date in a specific month (0 = Jan, 1 = Feb, 2 = Mar)
    const getRandomDateInMonth = (year, monthIndex) => {
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0); // Last day of month
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      date.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM - 8 PM
      return date;
    };

    // 6. Loop Listeners -> Create Profile -> Create Sessions spanning Jan, Feb, Mar
    for (const l of listenersData) {
      
      const user = await User.create({
        username: l.name,
        email: l.email,
        password: "password123",
        role: "listener",
        emailVerified: true,
        walletBalance: 1000
      });

      // 🟢 Calculate Financials
      // We are forcing 4 pending sessions total per listener (1 in Feb, 3 in Mar). 4 * $400 = $1,600 pending.
      const totalLifetimeEarnings = l.sessions * 400;
      const pendingAmount = 1600; 
      const paidOutAmount = Math.max(0, totalLifetimeEarnings - pendingAmount);

      await ListenerProfile.create({
        userId: user._id,
        isOnline: l.online,
        preferredDays: l.days,
        totalSessionsCompleted: l.sessions,
        totalEarnings: totalLifetimeEarnings, 
        totalPaidOut: paidOutAmount, 
        bio: l.bio,
        rating: { average: l.rating, count: 10 }
      });

      const sessionDocs = [];

      // 🟢 HELPER: Creates the session object
      const buildSession = (date, status) => {
        const endTime = new Date(date.getTime() + 60 * 60 * 1000); 
        return {
          userId: seekerIds[Math.floor(Math.random() * seekerIds.length)],
          listenerId: user._id,
          assignedBy: staff[0]._id, 
          status: "completed",
          scheduledDate: date,
          preferredTimeStart: date,
          preferredTimeEnd: endTime,
          scheduledStartAt: date,
          startedAt: date,
          endedAt: endTime,
          bookedDurationMinutes: 60,
          actualDurationMinutes: 60,
          price: 500,
          listenerPayout: 400,
          platformFee: 100,
          payoutStatus: status, // "pending" or "paid"
          review: {
            rating: Math.round(l.rating), 
            comment: randomReviews[Math.floor(Math.random() * randomReviews.length)],
            createdAt: endTime
          },
          timeline: [
            { status: "created", time: new Date(date.getTime() - 86400000), note: "Booked" },
            { status: "completed", time: endTime, note: "Session finished" }
          ]
        };
      };

      // 🗓️ JANUARY 2026: 3 Sessions (All Paid)
      for (let i = 0; i < 3; i++) sessionDocs.push(buildSession(getRandomDateInMonth(2026, 0), "paid"));
      
      // 🗓️ FEBRUARY 2026: 3 Paid, 1 Pending (Testing a late payout!)
      for (let i = 0; i < 3; i++) sessionDocs.push(buildSession(getRandomDateInMonth(2026, 1), "paid"));
      sessionDocs.push(buildSession(getRandomDateInMonth(2026, 1), "pending")); 

      // 🗓️ MARCH 2026: 3 Sessions (All Pending)
      for (let i = 0; i < 3; i++) sessionDocs.push(buildSession(getRandomDateInMonth(2026, 2), "pending"));

      await Session.insertMany(sessionDocs);
      console.log(`✅ Created: ${l.name} + 10 Sessions (Jan-Mar)`);
    }

    console.log("✨ All Data Imported Successfully!");
    process.exit();

  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
};

seed();