import { Resend } from "resend";
import "../config/env.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "CabPro <onboarding@resend.dev>"; // free tier sender

export const sendJoinRequestEmail = async (
  leaderEmail, leaderName, participantName,
  participantRating, participantReviews, rideDetails,
) => {
  try {
    await resend.emails.send({
      from: FROM,
      to: leaderEmail,
      subject: `🚗 New Join Request: ${participantName} wants to join your ride to ${rideDetails.destination}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">🚗 New Ride Join Request</h2>
          <p>Dear <strong>${leaderName}</strong>,</p>
          <p>You have received a new join request from <strong>${participantName}</strong>.</p>
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
            ${rideDetails.pricePerHead ? `<p><strong>Price per Head:</strong> ₹${rideDetails.pricePerHead}</p>` : ""}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://cab-pro.vercel.app/dashboard"
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Requests
            </a>
          </div>
        </div>
      `,
    });
    console.log("Join request email sent to:", leaderEmail);
  } catch (error) {
    console.error("Error sending join request email:", error);
    throw error;
  }
};

export const sendRideStatusEmail = async (userEmail, userName, status, rideDetails) => {
  const statusColor = status === "ACCEPTED" ? "#4CAF50" : "#f44336";
  const statusEmoji = status === "ACCEPTED" ? "✅" : "❌";
  try {
    await resend.emails.send({
      from: FROM,
      to: userEmail,
      subject: `${statusEmoji} Ride Request ${status}: ${rideDetails.origin} to ${rideDetails.destination}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid ${statusColor}; padding-bottom: 10px;">${statusEmoji} Ride Request ${status}</h2>
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your ride request has been <strong>${status.toLowerCase()}</strong> by the ride leader.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🚙 Ride Details</h3>
            <p><strong>From:</strong> ${rideDetails.origin}</p>
            <p><strong>To:</strong> ${rideDetails.destination}</p>
            <p><strong>Date:</strong> ${new Date(rideDetails.rideDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${rideDetails.rideTime}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://cab-pro.vercel.app/dashboard"
               style="background-color: ${statusColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      `,
    });
    console.log(`Ride ${status} email sent to:`, userEmail);
  } catch (error) {
    console.error(`Error sending ride ${status} email:`, error);
    throw error;
  }
};

export const sendLeaderConfirmationEmail = async (
  leaderEmail, leaderName, participantName,
  participantPhone, participantEmail, rideDetails,
) => {
  try {
    await resend.emails.send({
      from: FROM,
      to: leaderEmail,
      subject: `✅ Ride Joined: ${participantName} is joining your ride`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">✅ Ride Request Accepted</h2>
          <p>Dear <strong>${leaderName}</strong>,</p>
          <p>You have accepted the ride request from <strong>${participantName}</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">👤 Participant Contact Info</h3>
            <p><strong>Name:</strong> ${participantName}</p>
            <p><strong>Email:</strong> ${participantEmail}</p>
            <p><strong>WhatsApp / Phone:</strong> ${participantPhone || "Not provided"}</p>
          </div>
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🚙 Ride Details</h3>
            <p><strong>From:</strong> ${rideDetails.origin}</p>
            <p><strong>To:</strong> ${rideDetails.destination}</p>
            <p><strong>Date:</strong> ${new Date(rideDetails.rideDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${rideDetails.rideTime}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://cab-pro.vercel.app/dashboard"
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
      `,
    });
    console.log("Leader confirmation email sent to:", leaderEmail);
  } catch (error) {
    console.error("Error sending leader confirmation email:", error);
    throw error;
  }
};