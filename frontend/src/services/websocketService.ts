import { io, Socket } from "socket.io-client";

export interface WebSocketEvent {
  type: string;
  timestamp: string;
  [key: string]: any;
}

export interface RideEvent extends WebSocketEvent {
  rideId?: string;
  ride?: any;
  updatedData?: any;
  reason?: string;
}

export interface RequestEvent extends WebSocketEvent {
  request: any;
  rideId?: string;
  userId?: string;
  rideLeaderId?: string;
  rejectionReason?: string;
}

export interface ParticipantEvent extends WebSocketEvent {
  rideId: string;
  participant: any;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Initialize event listeners map
    this.eventListeners.set("ride_created", []);
    this.eventListeners.set("ride_updated", []);
    this.eventListeners.set("ride_cancelled", []);
    this.eventListeners.set("ride_started", []);
    this.eventListeners.set("ride_completed", []);
    this.eventListeners.set("request_sent", []);
    this.eventListeners.set("request_accepted", []);
    this.eventListeners.set("request_rejected", []);
    this.eventListeners.set("request_cancelled", []);
    this.eventListeners.set("participant_joined", []);
    this.eventListeners.set("participant_left", []);
    this.eventListeners.set("connect", []);
    this.eventListeners.set("disconnect", []);
    this.eventListeners.set("connect_error", []);
  }

  connect(userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace(/^http/, "ws") || "ws://localhost:5001";
        
        this.socket = io(serverUrl, {
          auth: {
            userId: userId || `temp_user_${Date.now()}`
          },
          transports: ["websocket", "polling"],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay
        });

        this.socket.on("connect", () => {
          console.log("WebSocket connected successfully");
          this.reconnectAttempts = 0;
          this.emit("connect", { socketId: this.socket?.id });
          resolve();
        });

        this.socket.on("disconnect", (reason) => {
          console.log("WebSocket disconnected:", reason);
          this.emit("disconnect", { reason });
        });

        this.socket.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          this.emit("connect_error", { error });
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          }
        });

        // Setup ride event listeners
        this.setupRideEventListeners();

      } catch (error) {
        reject(error);
      }
    });
  }

  private setupRideEventListeners() {
    if (!this.socket) return;

    // Ride events
    this.socket.on("ride_created", (data: RideEvent) => {
      console.log("Ride created event received:", data);
      this.emit("ride_created", data);
    });

    this.socket.on("ride_updated", (data: RideEvent) => {
      console.log("Ride updated event received:", data);
      this.emit("ride_updated", data);
    });

    this.socket.on("ride_cancelled", (data: RideEvent) => {
      console.log("Ride cancelled event received:", data);
      this.emit("ride_cancelled", data);
    });

    this.socket.on("ride_started", (data: RideEvent) => {
      console.log("Ride started event received:", data);
      this.emit("ride_started", data);
    });

    this.socket.on("ride_completed", (data: RideEvent) => {
      console.log("Ride completed event received:", data);
      this.emit("ride_completed", data);
    });

    // Request events
    this.socket.on("request_sent", (data: RequestEvent) => {
      console.log("Request sent event received:", data);
      this.emit("request_sent", data);
    });

    this.socket.on("request_accepted", (data: RequestEvent) => {
      console.log("Request accepted event received:", data);
      this.emit("request_accepted", data);
    });

    this.socket.on("request_rejected", (data: RequestEvent) => {
      console.log("Request rejected event received:", data);
      this.emit("request_rejected", data);
    });

    this.socket.on("request_cancelled", (data: RequestEvent) => {
      console.log("Request cancelled event received:", data);
      this.emit("request_cancelled", data);
    });

    // Participant events
    this.socket.on("participant_joined", (data: ParticipantEvent) => {
      console.log("Participant joined event received:", data);
      this.emit("participant_joined", data);
    });

    this.socket.on("participant_left", (data: ParticipantEvent) => {
      console.log("Participant left event received:", data);
      this.emit("participant_left", data);
    });
  }

  // Join a ride room to receive ride-specific updates
  joinRide(rideId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_ride", rideId);
      console.log(`Joined ride room: ${rideId}`);
    }
  }

  // Leave a ride room
  leaveRide(rideId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leave_ride", rideId);
      console.log(`Left ride room: ${rideId}`);
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Reconnect WebSocket
  async reconnect(): Promise<void> {
    await this.reconnect();
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

export default websocketService;
