import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("SMTP credentials not configured. Skipping email setup.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendJoinRequestEmail = async (
  leaderEmail,
  leaderName,
  participantName,
  participantRating,
  participantReviews,
  rideDetails,
) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email.");
      return;
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
          🚗 New Ride Join Request
        </h2>
        
        <p>Dear <strong>${leaderName}</strong>,</p>
        
        <p>You have received a new join request for your ride from <strong>${participantName}</strong>.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">👤 Participant Details</h3>
          <p><strong>Name:</strong> ${participantName}</p>
          <p><strong>Rating:</strong> ⭐ ${participantRating}/5.0</p>
          <p><strong>Total Reviews:</strong> ${participantReviews}</p>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">🚙 Ride Details</h3>
          <p><strong>From:</strong> ${rideDetails.origin}</p>
          <p><strong>To:</strong> ${rideDetails.destination}</p>
          <p><strong>Date:</strong> ${new Date(rideDetails.rideDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${rideDetails.rideTime}</p>
          <p><strong>Vehicle Type:</strong> ${rideDetails.rideType}</p>
          <p><strong>Available Seats:</strong> ${rideDetails.availableSeats}</p>
          ${rideDetails.pricePerHead ? `<p><strong>Price per Head:</strong> ₹${rideDetails.pricePerHead}</p>` : ""}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666;">Please log in to your CabPro account to accept or reject this request.</p>
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard" 
             style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Requests
          </a>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            This is an automated notification from CabPro. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"CabPro" <${process.env.EMAIL_USER}>`,
      to: leaderEmail,
      subject: `🚗 New Join Request: ${participantName} wants to join your ride to ${rideDetails.destination}`,
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("Join request email sent successfully to:", leaderEmail);
  } catch (error) {
    console.error("Error sending join request email:", error);
    throw error;
  }
};

export const sendRideStatusEmail = async (
  userEmail,
  userName,
  status,
  rideDetails,
) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("Email transporter not configured. Skipping email.");
      return;
    }

    const statusColor = status === "ACCEPTED" ? "#4CAF50" : "#f44336";
    const statusEmoji = status === "ACCEPTED" ? "✅" : "❌";

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid ${statusColor}; padding-bottom: 10px;">
          ${statusEmoji} Ride Request ${status}
        </h2>
        
        <p>Dear <strong>${userName}</strong>,</p>
        
        <p>Your ride request has been <strong>${status.toLowerCase()}</strong> by the ride leader.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">🚙 Ride Details</h3>
          <p><strong>From:</strong> ${rideDetails.origin}</p>
          <p><strong>To:</strong> ${rideDetails.destination}</p>
          <p><strong>Date:</strong> ${new Date(rideDetails.rideDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${rideDetails.rideTime}</p>
        </div>
        
        ${
          status === "ACCEPTED"
            ? `
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #4CAF50; font-weight: bold;">🎉 Get ready for your ride!</p>
            <p>Please arrive at the pickup point on time.</p>
          </div>
        `
            : ""
        }
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            This is an automated notification from CabPro. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"CabPro" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `${statusEmoji} Ride Request ${status}: ${rideDetails.origin} to ${rideDetails.destination}`,
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Ride ${status} email sent successfully to:`, userEmail);
  } catch (error) {
    console.error(`Error sending ride ${status} email:`, error);
    throw error;
  }
};
