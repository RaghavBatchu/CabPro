import { Phone, Users, Clock, MapPin, User, MessageCircle } from "lucide-react";
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
  onRemoveParticipant?: (rideId: string, participantId: string) => void;
}

export const RideCard = ({
  ride,
  currentUserId,
  onJoinRide,
  onLeaveRide,
  onDeleteRide,
  onRemoveParticipant,
}: RideCardProps) => {
  const isDriver = ride.driverId === currentUserId;
  const isParticipant = Array.isArray(ride.participants)
    ? ride.participants.includes(currentUserId)
    : false;
  const isFull = (ride.availableSeats ?? 0) === 0;

  const getWhatsAppLink = (number: string) => {
    const cleaned = number.replace(/\D/g, "");
    const phone = `91${cleaned}`; // India-only project

    const isDesktop =
      typeof navigator !== "undefined" &&
      !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    return isDesktop
      ? `https://web.whatsapp.com/send?phone=${phone}`
      : `https://wa.me/${phone}`;
  };

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
                <span className="font-medium text-card-foreground">
                  {ride.origin} → {ride.destination}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {ride.time} • {new Date(ride.date).toLocaleDateString()}
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

        {(isParticipant || isDriver) && (
          <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-4 shadow-md">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/80 font-medium">
                Ride Leader Contact
              </p>
              <a
                href={`tel:${ride.driverPhone}`}
                className="text-base font-bold text-white hover:underline"
              >
                {ride.driverPhone}
              </a>
            </div>
          </div>
        )}

        {(isDriver || isParticipant) && ride.participants.length > 0 && (
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-card-foreground">
                Participants:
              </p>
              <Badge variant="secondary" className="ml-auto text-xs">
                {ride.participants.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {(ride.participantsInfo && ride.participantsInfo.length
                ? ride.participantsInfo.map((p) => ({
                    _id: p._id,
                    fullName: p.fullName,
                    whatsappNumber: p.whatsappNumber,
                  }))
                : (Array.isArray(ride.participants)
                    ? ride.participants
                    : []
                  ).map((id) => {
                    const sid = String(id || "");
                    return {
                      _id: sid,
                      fullName: `Participant ${sid.slice(-4)}`,
                      whatsappNumber: "",
                    };
                  })
              ).map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm text-card-foreground font-medium">
                        {p.fullName}
                      </span>
                      {p.whatsappNumber && (
                        <span className="text-xs text-muted-foreground">
                          {p.whatsappNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.whatsappNumber && (
                      <a
                        href={getWhatsAppLink(p.whatsappNumber)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          size="sm"
                          className="flex items-center gap-1 bg-[#25D366] hover:bg-[#20BA5A] text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </a>
                    )}
                    {isDriver && onRemoveParticipant && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveParticipant(ride._id, p._id)}
                        className="shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
                      onDeleteRide(ride._id);
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
                  onClick={() => onLeaveRide(ride._id)}
                >
                  Leave Ride
                </Button>
              ) : (
                <Button
                  className="btn-primary flex-1 transition-all duration-200"
                  disabled={isFull}
                  onClick={() => onJoinRide(ride._id)}
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
