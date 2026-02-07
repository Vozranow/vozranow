import ListenerApplication from "../models/listenerApplication.js";
import crypto from "crypto"; // Native Node module for generating tokens

// @desc    Public: User submits application
// @route   POST /api/listener/apply
export const submitApplication = async (req, res) => {
    try {
        const { name, email, phone, answers } = req.body;

        // Check if already applied
        const existing = await ListenerApplication.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Application with this email already exists" });
        }

        const application = await ListenerApplication.create({
            name,
            email,
            phone,
            answers,
            status: "pending"
        });

        res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Apply Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Manager: View all pending applications
// @route   GET /api/manager/pending
export const getPendingApplications = async (req, res) => {
    try {
        const applications = await ListenerApplication.find({ status: "pending" })
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Manager: Accept or Reject Application
// @route   PUT /api/manager/application/:id/review
export const reviewApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, rejectionReason } = req.body; // action = "approve" or "reject"
        const managerId = req.user._id;

        const app = await ListenerApplication.findById(id);
        if (!app) return res.status(404).json({ message: "Application not found" });

       
        if (action === "reject") {
            app.status = "rejected";
            app.rejectedAt = new Date(); // ⏰ Start the 7-day timer
            app.rejectionReason = rejectionReason || "Not specified";
            await app.save();

            return res.status(200).json({ message: "Application rejected. It will remain in archive for 7 days." });
        }

        if (action === "approve") {
            app.status = "approved";
            app.reviewedBy = managerId;

            // 🔐 GENERATE INVITE TOKEN
            // This token allows them to register as a listener specifically
            const token = crypto.randomBytes(32).toString("hex");
            app.inviteToken = token;

            // Token valid for 7 days
            app.inviteTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;

            await app.save();

            // 📧 MOCK EMAIL SENDING
            // Since we don't have email setup, we return the link to the Manager
            // so you can manually copy-paste it during testing.
            const registrationLink = `http://localhost:5173/listener-register?token=${token}`;

            return res.status(200).json({
                message: "Application approved",
                registrationLink // Manager copies this
            });
        }

    } catch (error) {
        console.error("Review Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

