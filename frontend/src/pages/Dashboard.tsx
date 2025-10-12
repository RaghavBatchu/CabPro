import { useState, useEffect } from "react";
import { RideCard } from "@/components/RideCard";
import { CreateRideModal } from "@/components/CreateRideModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";
import { fetchRides, joinRide, leaveRide, Ride, RideFilters } from "@/services/rideApi";
import { deleteRide as apiDeleteRide } from "@/services/rideApi";
import { useUser } from "@clerk/clerk-react";
import { fetchUserByEmail } from "@/services/userApi";

const Dashboard = () => {
  const { user } = useUser();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [seatsFilter, setSeatsFilter] = useState<string>("all");

  const origins = Array.from(new Set(rides.map((r) => r.origin)));
  const destinations = Array.from(new Set(rides.map((r) => r.destination)));

  const todayYmd = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  // Load user data and rides
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load user data once (don't refetch on every effect run)
        // Use the fetched user info locally so we can immediately pass userGender to the rides fetch
        let effectiveUserData = userData;
        if (user?.primaryEmailAddress?.emailAddress && !effectiveUserData) {
          try {
            const userInfo = await fetchUserByEmail(user.primaryEmailAddress.emailAddress);
            setUserData(userInfo);
            effectiveUserData = userInfo;
          } catch (err) {
            console.error('Failed to load user data:', err);
          }
        }

        // Load rides with current filters
        const filters: RideFilters = {};
        if (originFilter !== "all") filters.origin = originFilter;
        if (destinationFilter !== "all") filters.destination = destinationFilter;
        if (dateFilter) filters.date = dateFilter;
        if (timeFilter) filters.time = timeFilter;
        // Normalize gender filter: map UI value "Any" to backend "All"
        if (genderFilter !== "all") {
          const normalizedGender = genderFilter === "Any" ? "All" : genderFilter;
          filters.genderPreference = normalizedGender;
        }
        if (seatsFilter !== "all") filters.minSeats = parseInt(seatsFilter);
        // Ensure we include the current user's gender so backend can filter rides
        if (effectiveUserData?.gender) {
          filters.userGender = effectiveUserData.gender;
        }

        const ridesData = await fetchRides(filters);
        setRides(ridesData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load rides");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Refresh rides every 60 seconds so past rides are removed dynamically
    const interval = setInterval(() => {
      loadData();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [user, userData, originFilter, destinationFilter, dateFilter, timeFilter, genderFilter, seatsFilter]);

  const filteredRides = rides;

  const handleJoinRide = async (rideId: string) => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }

    try {
      const updatedRide = await joinRide(rideId, userData._id);
      setRides(prev => prev.map(ride => ride._id === rideId ? updatedRide : ride));
      toast.success("Joined ride successfully!");
    } catch (error: any) {
      console.error("Failed to join ride:", error);
      toast.error(error.message || "Failed to join ride");
    }
  };

  const handleLeaveRide = async (rideId: string) => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }

    try {
      const updatedRide = await leaveRide(rideId, userData._id);
      setRides(prev => prev.map(ride => ride._id === rideId ? updatedRide : ride));
      toast.info("Left ride successfully");
    } catch (error: any) {
      console.error("Failed to leave ride:", error);
      toast.error(error.message || "Failed to leave ride");
    }
  };

  const handleRemoveParticipant = async (rideId: string, participantId: string) => {
    try {
      const updatedRide = await leaveRide(rideId, participantId);
      setRides(prev => prev.map(ride => ride._id === rideId ? updatedRide : ride));
      toast.info("Participant removed");
    } catch (error: any) {
      console.error("Failed to remove participant:", error);
      toast.error(error.message || "Failed to remove participant");
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }

    try {
      await apiDeleteRide(rideId, userData._id);
      setRides(prev => prev.filter(r => r._id !== rideId));
      toast.success("Ride cancelled successfully");
    } catch (error: any) {
      console.error("Failed to delete ride:", error);
      toast.error(error.message || "Failed to cancel ride");
    }
  };

  const handleRideCreated = () => {
    // Reload rides after creating a new one
    const loadRides = async () => {
      try {
        // If userData is not loaded yet (rare), fetch it so we can pass gender to the backend
        let effectiveUserData = userData;
        if (!effectiveUserData && user?.primaryEmailAddress?.emailAddress) {
          try {
            const ud = await fetchUserByEmail(user.primaryEmailAddress.emailAddress);
            setUserData(ud);
            effectiveUserData = ud;
          } catch (err) {
            console.error('Failed to fetch user data during reload:', err);
          }
        }

        const filters: RideFilters = {};
        if (originFilter !== "all") filters.origin = originFilter;
        if (destinationFilter !== "all") filters.destination = destinationFilter;
        if (dateFilter) filters.date = dateFilter;
        if (timeFilter) filters.time = timeFilter;
        if (genderFilter !== "all") {
          const normalizedGender = genderFilter === "Any" ? "All" : genderFilter;
          filters.genderPreference = normalizedGender;
        }
        if (seatsFilter !== "all") filters.minSeats = parseInt(seatsFilter);
        if (effectiveUserData?.gender) {
          filters.userGender = effectiveUserData.gender;
        }

        const ridesData = await fetchRides(filters);
        setRides(ridesData);
      } catch (error) {
        console.error("Failed to reload rides:", error);
      }
    };
    loadRides();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Available Rides
            </h1>
            <p className="text-muted-foreground">
              Find and join rides that match your schedule
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Ride
          </Button>
        </div>
      </div>

      <div className="filter-section mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              From
            </label>
            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All origins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All origins</SelectItem>
                {origins.map((origin) => (
                  <SelectItem key={origin} value={origin}>
                    {origin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              Date
            </label>
            <DatePicker
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="Select date"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Time
            </label>
            <TimePicker
              value={timeFilter}
              onChange={setTimeFilter}
              placeholder="Select time"
              disablePast={dateFilter === todayYmd}
            />
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
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground">Loading rides...</p>
          </div>
        ) : filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
              <RideCard
                key={ride._id}
                ride={ride}
                currentUserId={userData?._id || ""}
                onJoinRide={handleJoinRide}
                onLeaveRide={handleLeaveRide}
                onRemoveParticipant={handleRemoveParticipant}
                onDeleteRide={handleDeleteRide}
              />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No rides match your filters
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your Own Ride
            </Button>
          </div>
        )}
      </div>

      <CreateRideModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRideCreated={handleRideCreated}
        initialFilters={{
          origin: originFilter !== "all" ? originFilter : undefined,
          destination: destinationFilter !== "all" ? destinationFilter : undefined,
          date: dateFilter || undefined,
          time: timeFilter || undefined,
        }}
      />
    </div>
  );
};

export default Dashboard;
