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
import { fetchRides, Ride, RideFilters } from "@/services/rideApi";
import { cancelRide } from "@/services/rideApi";
import { sendJoinRequest, rejectRideRequest, cancelRideRequest, fetchUserRequests } from "@/services/ride_requestsApi";
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
  const [originOptions, setOriginOptions] = useState<string[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<string[]>([]);
  const [userRequestsMap, setUserRequestsMap] = useState<Record<string, string>>({});
  const [userRequestIdsMap, setUserRequestIdsMap] = useState<Record<string, string>>({});
  const [userRejectionReasonsMap, setUserRejectionReasonsMap] = useState<Record<string, string>>({});

  const loadUserRequests = async () => {
    if (!userData?.id) return;
    try {
      const requests = await fetchUserRequests(userData.id);
      const map: Record<string, string> = {};
      const idMap: Record<string, string> = {};
      const rejectionMap: Record<string, string> = {};
      requests.forEach((req: any) => {
        map[req.rideId] = req.status;
        idMap[req.rideId] = req.id;
        if (req.rejectionReason) {
            rejectionMap[req.rideId] = req.rejectionReason;
        }
      });
      setUserRequestsMap(map);
      setUserRequestIdsMap(idMap);
      setUserRejectionReasonsMap(rejectionMap);
    } catch (error) {
      console.error("Failed to load user requests:", error);
    }
  };

  useEffect(() => {
    loadUserRequests();
  }, [userData]);

  const origins = originOptions.length > 0 ? originOptions : Array.from(new Set(rides.map((r) => r.origin)));
  const destinations = destinationOptions.length > 0 ? destinationOptions : Array.from(new Set(rides.map((r) => r.destination)));

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
            // fetchUserByEmail returns an array, get the first element
            const userObj = Array.isArray(userInfo) ? userInfo[0] : userInfo;
            setUserData(userObj);
            effectiveUserData = userObj;
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
        // Gender preference is part of the Ride model, not a filter
        if (seatsFilter !== "all") filters.minSeats = parseInt(seatsFilter);
        // Ensure we include the current user's gender so backend can filter rides
        if (effectiveUserData?.gender) {
          filters.userGender = effectiveUserData.gender;
        }

    const ridesData = await fetchRides(filters);
    setRides(ridesData);
    const newOrigins = Array.from(new Set(ridesData.map((r:any) => r.origin))).filter(Boolean);
    const newDestinations = Array.from(new Set(ridesData.map((r:any) => r.destination))).filter(Boolean);
    if (newOrigins.length > 0) setOriginOptions(newOrigins);
    if (newDestinations.length > 0) setDestinationOptions(newDestinations);
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
      await sendJoinRequest({ rideId, userId: userData.id });
      toast.success("Join request sent successfully! Waiting for leader approval.");
      // Reload requests to update UI
      loadUserRequests();
      // Optionally reload rides to show updated request status
      const filters: RideFilters = {};
      if (originFilter !== "all") filters.origin = originFilter;
      if (destinationFilter !== "all") filters.destination = destinationFilter;
      if (dateFilter) filters.date = dateFilter;
      if (timeFilter) filters.time = timeFilter;
      // Gender preference is part of the Ride model, not a filter
      if (seatsFilter !== "all") filters.minSeats = parseInt(seatsFilter);
      if (userData?.gender) filters.userGender = userData.gender;
      const ridesData = await fetchRides(filters);
      setRides(ridesData);
    } catch (error: any) {
      console.error("Failed to send join request:", error);
      toast.error(error.message || "Failed to send join request");
    }
  };

  const handleLeaveRide = async (rideId: string) => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }
    
    const requestId = userRequestIdsMap[rideId];
    if (!requestId) {
      toast.error("Request not found for this ride");
      return;
    }

    try {
      await cancelRideRequest(requestId);
      toast.warning("You have left the ride. Frequent cancellations are discouraged.");
      // Reload user requests to update status maps
      await loadUserRequests();
      
      // Reload rides to show updated status
      const filters: RideFilters = {};
      if (originFilter !== "all") filters.origin = originFilter;
      if (destinationFilter !== "all") filters.destination = destinationFilter;
      if (dateFilter) filters.date = dateFilter;
      if (timeFilter) filters.time = timeFilter;
      // Gender preference is part of the Ride model, not a filter
      if (seatsFilter !== "all") filters.minSeats = parseInt(seatsFilter);
      if (userData?.gender) filters.userGender = userData.gender;
      const ridesData = await fetchRides(filters);
      setRides(ridesData);
    } catch (error: any) {
      console.error("Failed to cancel request:", error);
      toast.error(error.message || "Failed to cancel request");
    }
  };

  const handleRemoveParticipant = async (requestId: string) => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }

    try {
      await rejectRideRequest(requestId, { leaderId: userData._id });
      toast.info("Participant request rejected");
      // Reload rides to show updated status
      const filters: RideFilters = {};
      if (originFilter !== "all") filters.origin = originFilter;
      if (destinationFilter !== "all") filters.destination = destinationFilter;
      if (dateFilter) filters.date = dateFilter;
      if (timeFilter) filters.time = timeFilter;
      // Gender preference is part of the Ride model, not a filter
      if (seatsFilter !== "all") filters.minSeats = parseInt(seatsFilter);
      if (userData?.gender) filters.userGender = userData.gender;
      const ridesData = await fetchRides(filters);
      setRides(ridesData);
    } catch (error: any) {
      console.error("Failed to reject participant:", error);
      toast.error(error.message || "Failed to reject participant");
    }
  };

  const handleDeleteRide = async (rideId: string, reason?: string) => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }

    try {
      await cancelRide(rideId, userData.id, reason);
      setRides(prev => prev.filter(r => r.id !== rideId));
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
            // fetchUserByEmail returns an array, get the first element
            const userObj = Array.isArray(ud) ? ud[0] : ud;
            setUserData(userObj);
            effectiveUserData = userObj;
          } catch (err) {
            console.error('Failed to fetch user data during reload:', err);
          }
        }

        const filters: RideFilters = {};
        if (originFilter !== "all") filters.origin = originFilter;
        if (destinationFilter !== "all") filters.destination = destinationFilter;
        if (dateFilter) filters.date = dateFilter;
        if (timeFilter) filters.time = timeFilter;
        // Gender preference is part of the Ride model, not a filter
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
                key={ride.id}
                ride={ride}
                currentUserId={userData?.id || ""}
                onJoinRide={handleJoinRide}
                onLeaveRide={handleLeaveRide}
                onDeleteRide={handleDeleteRide}
                requestStatus={userRequestsMap[ride.id] as any}
                rejectionReason={userRejectionReasonsMap[ride.id]}
              />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No rides match your filters</p>
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
