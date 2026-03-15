import { useState, useEffect, useCallback, useRef } from "react";
import websocketService, { WebSocketEvent, RideEvent, RequestEvent, ParticipantEvent } from "@/services/websocketService";

export interface UseWebSocketOptions {
  userId?: string;
  autoConnect?: boolean;
  autoReconnect?: boolean;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  socketId: string | undefined;
  connectionError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  joinRide: (rideId: string) => void;
  leaveRide: (rideId: string) => void;
  lastEvent: WebSocketEvent | null;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const { userId, autoConnect = true, autoReconnect = true } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(async () => {
    try {
      setConnectionError(null);
      await websocketService.connect(userId);
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setConnectionError(error instanceof Error ? error.message : "Connection failed");
      
      // Auto-reconnect if enabled
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 5000);
      }
    }
  }, [userId, autoReconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    websocketService.disconnect();
  }, []);

  const reconnect = useCallback(async () => {
    await websocketService.reconnect();
  }, []);

  const joinRide = useCallback((rideId: string) => {
    websocketService.joinRide(rideId);
  }, []);

  const leaveRide = useCallback((rideId: string) => {
    websocketService.leaveRide(rideId);
  }, []);

  useEffect(() => {
    // Setup event listeners
    const handleConnect = (data: any) => {
      setIsConnected(true);
      setSocketId(data.socketId);
      setConnectionError(null);
    };

    const handleDisconnect = (data: any) => {
      setIsConnected(false);
      setSocketId(undefined);
      console.log("WebSocket disconnected:", data.reason);
    };

    const handleConnectError = (data: any) => {
      setConnectionError(data.error?.message || "Connection error");
      setIsConnected(false);
      setSocketId(undefined);
    };

    websocketService.on("connect", handleConnect);
    websocketService.on("disconnect", handleDisconnect);
    websocketService.on("connect_error", handleConnectError);

    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    // Cleanup
    return () => {
      websocketService.off("connect", handleConnect);
      websocketService.off("disconnect", handleDisconnect);
      websocketService.off("connect_error", handleConnectError);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    socketId,
    connectionError,
    connect,
    disconnect,
    reconnect,
    joinRide,
    leaveRide,
    lastEvent
  };
};

// Hook for ride-specific events
export const useRideEvents = (onRideEvent?: (event: RideEvent) => void) => {
  const [rideEvents, setRideEvents] = useState<RideEvent[]>([]);
  const maxEvents = 50; // Keep only last 50 events

  useEffect(() => {
    const handleRideCreated = (event: RideEvent) => {
      const newEvent = { ...event, receivedAt: new Date().toISOString() };
      setRideEvents(prev => [newEvent, ...prev].slice(0, maxEvents));
      onRideEvent?.(newEvent);
    };

    const handleRideUpdated = (event: RideEvent) => {
      const newEvent = { ...event, receivedAt: new Date().toISOString() };
      setRideEvents(prev => [newEvent, ...prev].slice(0, maxEvents));
      onRideEvent?.(newEvent);
    };

    const handleRideCancelled = (event: RideEvent) => {
      const newEvent = { ...event, receivedAt: new Date().toISOString() };
      setRideEvents(prev => [newEvent, ...prev].slice(0, maxEvents));
      onRideEvent?.(newEvent);
    };

    const handleRideStarted = (event: RideEvent) => {
      const newEvent = { ...event, receivedAt: new Date().toISOString() };
      setRideEvents(prev => [newEvent, ...prev].slice(0, maxEvents));
      onRideEvent?.(newEvent);
    };

    const handleRideCompleted = (event: RideEvent) => {
      const newEvent = { ...event, receivedAt: new Date().toISOString() };
      setRideEvents(prev => [newEvent, ...prev].slice(0, maxEvents));
      onRideEvent?.(newEvent);
    };

    websocketService.on("ride_created", handleRideCreated);
    websocketService.on("ride_updated", handleRideUpdated);
    websocketService.on("ride_cancelled", handleRideCancelled);
    websocketService.on("ride_started", handleRideStarted);
    websocketService.on("ride_completed", handleRideCompleted);

    return () => {
      websocketService.off("ride_created", handleRideCreated);
      websocketService.off("ride_updated", handleRideUpdated);
      websocketService.off("ride_cancelled", handleRideCancelled);
      websocketService.off("ride_started", handleRideStarted);
      websocketService.off("ride_completed", handleRideCompleted);
    };
  }, [onRideEvent]);

  return rideEvents;
};

// Hook for request events
export const useRequestEvents = (onRequestEvent?: (event: RequestEvent) => void) => {
  const [requestEvents, setRequestEvents] = useState<RequestEvent[]>([]);
  const maxEvents = 50;

  useEffect(() => {
    const handleRequestEvent = (event: RequestEvent) => {
      const newEvent = { ...event, receivedAt: new Date().toISOString() };
      setRequestEvents(prev => [newEvent, ...prev].slice(0, maxEvents));
      onRequestEvent?.(newEvent);
    };

    const handleRequestSent = (event: RequestEvent) => handleRequestEvent(event);
    const handleRequestAccepted = (event: RequestEvent) => handleRequestEvent(event);
    const handleRequestRejected = (event: RequestEvent) => handleRequestEvent(event);
    const handleRequestCancelled = (event: RequestEvent) => handleRequestEvent(event);

    websocketService.on("request_sent", handleRequestSent);
    websocketService.on("request_accepted", handleRequestAccepted);
    websocketService.on("request_rejected", handleRequestRejected);
    websocketService.on("request_cancelled", handleRequestCancelled);

    return () => {
      websocketService.off("request_sent", handleRequestSent);
      websocketService.off("request_accepted", handleRequestAccepted);
      websocketService.off("request_rejected", handleRequestRejected);
      websocketService.off("request_cancelled", handleRequestCancelled);
    };
  }, [onRequestEvent]);

  return requestEvents;
};

// Hook for participant events
export const useParticipantEvents = (onParticipantEvent?: (event: ParticipantEvent) => void) => {
  const [participantEvents, setParticipantEvents] = useState<ParticipantEvent[]>([]);
  const maxEvents = 50;

  useEffect(() => {
    const handleParticipantJoined = (event: ParticipantEvent) => {
      const newEvent = { ...event, receivedAt: new Date().toISOString() };
      setParticipantEvents(prev => [newEvent, ...prev].slice(0, maxEvents));
      onParticipantEvent?.(newEvent);
    };

    const handleParticipantLeft = (event: ParticipantEvent) => {
      const newEvent = { ...event, receivedAt: new Date().toISOString() };
      setParticipantEvents(prev => [newEvent, ...prev].slice(0, maxEvents));
      onParticipantEvent?.(newEvent);
    };

    websocketService.on("participant_joined", handleParticipantJoined);
    websocketService.on("participant_left", handleParticipantLeft);

    return () => {
      websocketService.off("participant_joined", handleParticipantJoined);
      websocketService.off("participant_left", handleParticipantLeft);
    };
  }, [onParticipantEvent]);

  return participantEvents;
};
