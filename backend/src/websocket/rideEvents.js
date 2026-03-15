import { broadcastToRide, broadcastToUser, broadcastToAll } from "./socketHandlers.js";

// Ride Events
export const emitRideCreated = (rideData) => {
  console.log("Emitting ride_created event:", rideData.id);
  broadcastToAll("ride_created", {
    type: "ride_created",
    ride: rideData,
    timestamp: new Date().toISOString()
  });
};

export const emitRideUpdated = (rideId, updatedData) => {
  console.log("Emitting ride_updated event:", rideId);
  broadcastToRide(rideId, "ride_updated", {
    type: "ride_updated",
    rideId,
    updatedData,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to all for dashboard updates
  broadcastToAll("ride_updated", {
    type: "ride_updated",
    rideId,
    updatedData,
    timestamp: new Date().toISOString()
  });
};

export const emitRideCancelled = (rideId, reason) => {
  console.log("Emitting ride_cancelled event:", rideId);
  broadcastToRide(rideId, "ride_cancelled", {
    type: "ride_cancelled",
    rideId,
    reason,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to all for dashboard updates
  broadcastToAll("ride_cancelled", {
    type: "ride_cancelled",
    rideId,
    reason,
    timestamp: new Date().toISOString()
  });
};

export const emitRideStarted = (rideId) => {
  console.log("Emitting ride_started event:", rideId);
  broadcastToRide(rideId, "ride_started", {
    type: "ride_started",
    rideId,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to all for dashboard updates
  broadcastToAll("ride_started", {
    type: "ride_started",
    rideId,
    timestamp: new Date().toISOString()
  });
};

export const emitRideCompleted = (rideId) => {
  console.log("Emitting ride_completed event:", rideId);
  broadcastToRide(rideId, "ride_completed", {
    type: "ride_completed",
    rideId,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to all for dashboard updates
  broadcastToAll("ride_completed", {
    type: "ride_completed",
    rideId,
    timestamp: new Date().toISOString()
  });
};

// Ride Request Events
export const emitRequestSent = (requestData) => {
  console.log("Emitting request_sent event:", requestData.id);
  
  // Notify ride leader
  broadcastToUser(requestData.rideLeaderId, "request_sent", {
    type: "request_sent",
    request: requestData,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to ride room
  broadcastToRide(requestData.rideId, "request_sent", {
    type: "request_sent",
    request: requestData,
    timestamp: new Date().toISOString()
  });
};

export const emitRequestAccepted = (requestData) => {
  console.log("Emitting request_accepted event:", requestData.id);
  
  // Notify the user who sent the request
  broadcastToUser(requestData.userId, "request_accepted", {
    type: "request_accepted",
    request: requestData,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to ride room for participant list updates
  broadcastToRide(requestData.rideId, "request_accepted", {
    type: "request_accepted",
    request: requestData,
    timestamp: new Date().toISOString()
  });
};

export const emitRequestRejected = (requestData) => {
  console.log("Emitting request_rejected event:", requestData.id);
  
  // Notify the user who sent the request
  broadcastToUser(requestData.userId, "request_rejected", {
    type: "request_rejected",
    request: requestData,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to ride room
  broadcastToRide(requestData.rideId, "request_rejected", {
    type: "request_rejected",
    request: requestData,
    timestamp: new Date().toISOString()
  });
};

export const emitRequestCancelled = (requestData) => {
  console.log("Emitting request_cancelled event:", requestData.id);
  
  // Notify ride leader
  broadcastToUser(requestData.rideLeaderId, "request_cancelled", {
    type: "request_cancelled",
    request: requestData,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to ride room
  broadcastToRide(requestData.rideId, "request_cancelled", {
    type: "request_cancelled",
    request: requestData,
    timestamp: new Date().toISOString()
  });
};

// Participant Events
export const emitParticipantJoined = (rideId, participantData) => {
  console.log("Emitting participant_joined event:", participantData.userId);
  
  // Broadcast to ride room
  broadcastToRide(rideId, "participant_joined", {
    type: "participant_joined",
    rideId,
    participant: participantData,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to all for dashboard updates
  broadcastToAll("participant_joined", {
    type: "participant_joined",
    rideId,
    participant: participantData,
    timestamp: new Date().toISOString()
  });
};

export const emitParticipantLeft = (rideId, participantData) => {
  console.log("Emitting participant_left event:", participantData.userId);
  
  // Broadcast to ride room
  broadcastToRide(rideId, "participant_left", {
    type: "participant_left",
    rideId,
    participant: participantData,
    timestamp: new Date().toISOString()
  });
  
  // Also broadcast to all for dashboard updates
  broadcastToAll("participant_left", {
    type: "participant_left",
    rideId,
    participant: participantData,
    timestamp: new Date().toISOString()
  });
};
