import { useState } from "react";
import { RideCard } from "@/components/RideCard";
import { mockRides, mockUser, Ride } from "@/components/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Dashboard = () => {
  const [rides, setRides] = useState<Ride[]>(mockRides);
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [seatsFilter, setSeatsFilter] = useState<string>("all");

  const destinations = Array.from(new Set(mockRides.map((r) => r.destination)));

  const filteredRides = rides.filter((ride) => {
    if (destinationFilter !== "all" && ride.destination !== destinationFilter)
      return false;
    if (timeFilter !== "all") {
      const hour = parseInt(ride.time.split(":")[0]);
      if (timeFilter === "morning" && (hour < 6 || hour >= 12)) return false;
      if (timeFilter === "afternoon" && (hour < 12 || hour >= 18)) return false;
      if (timeFilter === "evening" && (hour < 18 || hour >= 24)) return false;
    }
    if (genderFilter !== "all" && ride.genderPreference !== genderFilter)
      return false;
    if (seatsFilter !== "all") {
      const seats = parseInt(seatsFilter);
      if (ride.availableSeats < seats) return false;
    }
    return true;
  });

  const handleJoinRide = (rideId: string) => {
    setRides((prev) =>
      prev.map((ride) => {
        if (ride.id === rideId && ride.availableSeats > 0) {
          toast.success("Joined ride successfully!");
          return {
            ...ride,
            availableSeats: ride.availableSeats - 1,
            participants: [...ride.participants, mockUser.id],
          };
        }
        return ride;
      })
    );
  };

  const handleLeaveRide = (rideId: string) => {
    setRides((prev) =>
      prev.map((ride) => {
        if (ride.id === rideId && ride.participants.includes(mockUser.id)) {
          toast.info("Left ride successfully");
          return {
            ...ride,
            availableSeats: ride.availableSeats + 1,
            participants: ride.participants.filter((p) => p !== mockUser.id),
          };
        }
        return ride;
      })
    );
  };

  const handleRemoveParticipant = (rideId: string, participantId: string) => {
    setRides((prev) =>
      prev.map((ride) => {
        if (ride.id === rideId) {
          toast.info("Participant removed");
          return {
            ...ride,
            availableSeats: ride.availableSeats + 1,
            participants: ride.participants.filter((p) => p !== participantId),
          };
        }
        return ride;
      })
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Available Rides
        </h1>
        <p className="text-muted-foreground">
          Find and join rides that match your schedule
        </p>
      </div>

      <div className="filter-section mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Destination
            </label>
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All destinations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All destinations</SelectItem>
                {destinations.map((dest) => (
                  <SelectItem key={dest} value={dest}>
                    {dest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Time Range
            </label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All times" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All times</SelectItem>
                <SelectItem value="morning">Morning (6AM-12PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12PM-6PM)</SelectItem>
                <SelectItem value="evening">Evening (6PM-12AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Gender Preference
            </label>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Min. Available Seats
            </label>
            <Select value={seatsFilter} onValueChange={setSeatsFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Any seats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any seats</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              currentUserId={mockUser.id}
              onJoinRide={handleJoinRide}
              onLeaveRide={handleLeaveRide}
              onRemoveParticipant={handleRemoveParticipant}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground">
              No rides match your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
