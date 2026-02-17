import { Users, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Ride } from "@/services/rideApi";
import { cn } from "@/lib/utils";

interface RideCardProps {
  ride: Ride;
  currentUserId: string;
  onJoinRide: (rideId: string) => void;
  onLeaveRide: (rideId: string) => void;
  onDeleteRide?: (rideId: string) => void;
}

export const RideCard = ({
  ride,
  currentUserId,
  onJoinRide,
  onLeaveRide,
  onDeleteRide,
}: RideCardProps) => {
  const isDriver = ride.createdBy === currentUserId;
  // Note: Participant checking requires ride requests API
  const isParticipant = false; // Simplified for now
  const isFull = (ride.availableSeats ?? 0) === 0;

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
              {isFull ? "Full" : `${ride.availableSeats} Seats`}
            </Badge>
            <Badge className={getGenderBadgeColor(ride.genderPreference)}>
              {ride.genderPreference}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {ride.totalSeats - ride.availableSeats}/{ride.totalSeats} seats
            filled
          </span>
        </div>

        {/* Contact information would come from user data, not ride data */}

        {/* Participant list would require fetching ride requests data */}

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
