import { Users, Clock, MapPin, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Ride, fetchRideById } from "@/services/rideApi";
import { acceptRideRequest, rejectRideRequest } from "@/services/ride_requestsApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface Participant {
  id: string; // user id
  fullName: string;
  personalEmail: string;
  whatsappNumber: string;
  gender: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED"; // request status
  requestId: string; // request id
  averageRating: string | number;
  totalReviews: number;
}

interface RideCardProps {
  ride: Ride;
  currentUserId: string;
  onJoinRide: (rideId: string) => void;
  onLeaveRide: (rideId: string) => void;
  onDeleteRide?: (rideId: string) => void;
  requestStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null;
}

export const RideCard = ({
  ride,
  currentUserId,
  onJoinRide,
  onLeaveRide,
  onDeleteRide,
  requestStatus,
}: RideCardProps) => {
  const isDriver = ride.createdBy === currentUserId;
  const isParticipant = requestStatus === "ACCEPTED";
  const [availableSeats, setAvailableSeats] = useState(ride.availableSeats ?? 0);
  const isFull = (availableSeats ?? 0) === 0;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    setAvailableSeats(ride.availableSeats ?? 0);
  }, [ride.availableSeats]);

  useEffect(() => {
    // Only fetch participants if user is driver or accepted participant
    if (isDriver || isParticipant) {
      const loadParticipants = async () => {
        try {
          setLoadingParticipants(true);
          const rideDetails = await fetchRideById(ride.id);
          if (rideDetails.participants) {
            setParticipants(rideDetails.participants);
          }
        } catch (error) {
          console.error("Failed to load participants:", error);
        } finally {
          setLoadingParticipants(false);
        }
      };
      loadParticipants();
    }
  }, [ride.id, isDriver, isParticipant]);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRideRequest(requestId, { leaderId: currentUserId });
      toast.success("Request accepted");
      // refresh participants
      const rideDetails = await fetchRideById(ride.id);
      if (rideDetails.participants) {
        setParticipants(rideDetails.participants);
      }
      if (rideDetails.availableSeats !== undefined) {
        setAvailableSeats(rideDetails.availableSeats);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to accept request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRideRequest(requestId, { leaderId: currentUserId });
      toast.success("Request rejected");
      // refresh participants
      const rideDetails = await fetchRideById(ride.id);
      if (rideDetails.participants) {
        setParticipants(rideDetails.participants);
      }
      if (rideDetails.availableSeats !== undefined) {
        setAvailableSeats(rideDetails.availableSeats);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject request");
    }
  };

  const pendingRequests = participants.filter((p) => p.status === "PENDING");
  const confirmedParticipants = participants.filter((p) => p.status === "ACCEPTED");

  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case "Male":
        return "bg-[hsl(var(--gender-male))] text-white";
      case "Female":
        return "bg-[hsl(var(--gender-female))] text-white";
      default:
        return "bg-[hsl(var(--gender-any))] text-white";
    }
  };

  return (
    <Card className="ride-card hover:bg-[hsl(var(--ride-card-hover))] transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-card-foreground">
                Ride #{ride.id.slice(0, 8)}
              </h3>
              {isDriver && (
                <Badge className="bg-primary text-primary-foreground">
                  Ride Leader
                </Badge>
              )}
              {requestStatus === "PENDING" && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                  Requested
                </Badge>
              )}
              {isParticipant && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  Joined
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium text-card-foreground">
                  {ride.origin} → {ride.destination}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {ride.rideTime} • {new Date(ride.rideDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              className={cn(
                "status-badge",
                isFull
                  ? "bg-[hsl(var(--status-full))] text-white"
                  : "bg-[hsl(var(--status-available))] text-white"
              )}
            >
              {isFull ? "Full" : `${availableSeats} Seats`}
            </Badge>
            <Badge className={getGenderBadgeColor(ride.genderPreference)}>
              {ride.genderPreference}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {ride.totalSeats - availableSeats}/{ride.totalSeats} seats
            filled
          </span>
        </div>

        {/* Contact information would come from user data, not ride data */}

        {/* Participants & Requests List */}
        {(isDriver || isParticipant) && (
          <div className="border-t border-border/50 pt-4 mb-4 space-y-4">
            
            {/* Pending Requests (Driver Only) */}
            {isDriver && pendingRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-yellow-600">
                  <Clock className="w-4 h-4" />
                  Pending Requests ({pendingRequests.length})
                </h4>
                <div className="space-y-2">
                  {pendingRequests.map((p) => (
                    <div key={p.id} className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {p.fullName}
                            <Badge variant="outline" className="text-[10px] px-1 h-4">
                              {p.gender}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span>{Number(p.averageRating).toFixed(1)} ({p.totalReviews} reviews)</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            onClick={() => handleAccept(p.requestId)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleReject(p.requestId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed Participants */}
             <div>
               <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                 <Users className="w-4 h-4 text-primary" />
                 Confirmed Participants ({confirmedParticipants.length})
               </h4>
               {loadingParticipants ? (
                 <div className="text-xs text-muted-foreground animate-pulse">Loading participants...</div>
               ) : confirmedParticipants.length > 0 ? (
                 <div className="space-y-2">
                   {confirmedParticipants.map((p) => (
                     <div key={p.id} className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded border border-border/50">
                       <div className="flex flex-col">
                         <div className="flex items-center gap-2">
                           <span className="font-medium">{p.fullName}</span>
                           <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                             {p.gender}
                           </Badge>
                         </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span>{Number(p.averageRating).toFixed(1)}</span>
                          </div>
                       </div>
                       {isDriver && (
                         <span className="text-xs text-muted-foreground font-mono bg-background px-1 rounded border">
                           {p.whatsappNumber}
                         </span>
                       )}
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-muted-foreground italic">No confirmed participants yet</p>
               )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {isDriver ? (
            <>
              <Button
                variant="destructive"
                className="flex-1 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => {
                  if (typeof onDeleteRide === "function") {
                    // confirm before deleting
                    if (
                      window.confirm(
                        "Are you sure you want to cancel this ride? This cannot be undone."
                      )
                    ) {
                      onDeleteRide(ride.id);
                    }
                  }
                }}
              >
                Cancel Ride
              </Button>
            </>
          ) : (
            <>
              {isParticipant ? (
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))] transition-all duration-200"
                  onClick={() => onLeaveRide(ride.id)}
                >
                  Leave Ride
                </Button>
              ) : requestStatus === "PENDING" ? (
                 <Button
                  disabled
                  className="flex-1 bg-yellow-100 text-yellow-800 border-yellow-200 opacity-80"
                 >
                   Requested
                 </Button>
              ) : (
                <Button
                  className="btn-primary flex-1 transition-all duration-200"
                  disabled={isFull}
                  onClick={() => onJoinRide(ride.id)}
                >
                  {isFull ? "Ride Full" : "Join Ride"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
