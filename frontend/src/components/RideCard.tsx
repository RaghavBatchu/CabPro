import { Phone, Users, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Ride } from "@/components/data/mockData";
import { cn } from "@/lib/utils";

interface RideCardProps {
  ride: Ride;
  currentUserId: string;
  onJoinRide: (rideId: string) => void;
  onLeaveRide: (rideId: string) => void;
  onRemoveParticipant?: (rideId: string, participantId: string) => void;
}

export const RideCard = ({
  ride,
  currentUserId,
  onJoinRide,
  onLeaveRide,
  onRemoveParticipant,
}: RideCardProps) => {
  const isDriver = ride.driverId === currentUserId;
  const isParticipant = ride.participants.includes(currentUserId);
  const isFull = ride.availableSeats === 0;

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
    <Card className="ride-card hover:bg-[hsl(var(--ride-card-hover))]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-card-foreground">
                {ride.driverName}
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
                <span className="font-medium text-card-foreground">{ride.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{ride.time}</span>
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
            {ride.totalSeats - ride.availableSeats}/{ride.totalSeats} seats filled
          </span>
        </div>

        {(isParticipant || isDriver) && (
          <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
            <Phone className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">
              {ride.phone}
            </span>
          </div>
        )}

        {isDriver && ride.participants.length > 0 && (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium text-card-foreground">Participants:</p>
            <div className="space-y-2">
              {ride.participants.map((participantId) => (
                <div
                  key={participantId}
                  className="flex items-center justify-between rounded-lg bg-muted p-2"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-card-foreground">
                      Participant {participantId.slice(-4)}
                    </span>
                  </div>
                  {onRemoveParticipant && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveParticipant(ride.id, participantId)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isDriver && (
            <>
              {isParticipant ? (
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))]"
                  onClick={() => onLeaveRide(ride.id)}
                >
                  Leave Ride
                </Button>
              ) : (
                <Button
                  className="btn-primary flex-1"
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
