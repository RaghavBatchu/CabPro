import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Car, Users, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { fetchUserHistory, RideHistoryEntry } from "@/services/historyApi";
import { fetchUserByEmail } from "@/services/userApi";

const RideHistory = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [userData, setUserData] = useState<any>(null);
  const [history, setHistory] = useState<RideHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user data to get the correct user ID
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.primaryEmailAddress?.emailAddress) {
        try {
          const data = await fetchUserByEmail(user.primaryEmailAddress.emailAddress);
          // fetchUserByEmail returns an array, get the first element
          const userObj = Array.isArray(data) ? data[0] : data;
          setUserData(userObj);
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      }
    };
    loadUserData();
  }, [user]);

  // Fetch ride history
  useEffect(() => {
    const loadHistory = async () => {
      if (!userData?.id) return;
      
      try {
        setLoading(true);
        const response = await fetchUserHistory(userData.id);
        setHistory(response.history || []);
      } catch (error) {
        console.error("Failed to load history:", error);
        toast.error("Failed to load ride history");
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [userData]);

  // Categorize rides
  const upcomingRides = history.filter(r => {
    const isLeader = userData?.id === r.createdBy;
    const isActive = ["OPEN", "STARTED", "FULL"].includes(r.status);
    const isParticipating = r.myRequestStatus === "ACCEPTED" || r.myRequestStatus === "PENDING";
    
    // Show if ride is active AND (User is leader OR User is participating/pending)
    // If user cancelled or was rejected, don't show in upcoming
    return isActive && (isLeader || isParticipating);
  });

  const completedRides = history.filter(r => {
    const isLeader = userData?.id === r.createdBy;
    const isCompleted = r.status === "COMPLETED";
    const wasAccepted = r.myRequestStatus === "ACCEPTED";

    // Show if ride is completed AND (User is leader OR User was participating/pending)
    // Including PENDING here because if a ride completes while user was PENDING, it's a past interaction
    return isCompleted && (isLeader || wasAccepted || r.myRequestStatus === "PENDING");
  });

  const cancelledRides = history.filter(r => {
    const isLeader = userData?.id === r.createdBy;
    
    // 1. Ride itself was cancelled
    if (r.status === "CANCELLED") return true;

    // 2. User cancelled their request or was rejected (Ride is NOT cancelled)
    // Only for non-leaders
    if (!isLeader && (r.myRequestStatus === "CANCELLED" || r.myRequestStatus === "REJECTED")) {
      return true;
    }
    
    return false;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "CANCELLED") return "destructive";
    if (status === "COMPLETED") return "default";
    return "secondary";
  };

  const RideCard = ({ ride }: { ride: RideHistoryEntry }) => {
    const isLeader = userData?.id === ride.createdBy;
    const canReview = ride.status === "COMPLETED" || ride.status === "CANCELLED";
    
    let roleLabel = "Participant";
    let roleIcon = <Users className="h-4 w-4 text-green-600" />;

    if (isLeader) {
        roleLabel = "Leader";
        roleIcon = <Car className="h-4 w-4 text-blue-600" />;
    } else {
        if (ride.myRequestStatus === "ACCEPTED") {
            roleLabel = "Joined";
        } else if (ride.myRequestStatus === "PENDING") {
            roleLabel = "Requested";
            roleIcon = <Clock className="h-4 w-4 text-yellow-600" />;
        } else if (ride.myRequestStatus === "REJECTED") {
            roleLabel = "Rejected";
            roleIcon = <Users className="h-4 w-4 text-red-600" />;
        } else if (ride.myRequestStatus === "CANCELLED") {
             roleLabel = "Left";
             roleIcon = <Users className="h-4 w-4 text-gray-500" />;
        }
    }

    return (
      <Card className="mb-4 ride-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {roleIcon}
                <span className="text-sm font-medium">
                  {roleLabel}
                </span>
              </div>
              <Badge variant={getStatusColor(ride.status)}>
                {ride.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">{ride.origin}</span> →{" "}
                <span className="font-medium">{ride.destination}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(ride.rideDate)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatTime(ride.rideTime)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm capitalize">{ride.rideType}</span>
            </div>

            {ride.pricingType && (
              <div className="text-sm text-muted-foreground">
                Pricing: <span className="font-medium capitalize">{ride.pricingType}</span>
              </div>
            )}
            
            {/* Review Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!canReview}
                onClick={() => navigate('/reviews')}
              >
                <Star className="h-4 w-4 mr-2" />
                {canReview ? "Leave Review" : "Review Available After Completion"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading ride history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Ride History</h1>
        <p className="text-muted-foreground">
          View your completed and cancelled rides
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({history.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingRides.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRides.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledRides.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Ride History</h3>
              <p className="text-muted-foreground">You don't have any ride history yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingRides.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Upcoming Rides</h3>
              <p className="text-muted-foreground">You don't have any upcoming rides scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedRides.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Completed Rides</h3>
              <p className="text-muted-foreground">You don't have any completed rides yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelledRides.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Cancelled Rides</h3>
              <p className="text-muted-foreground">You don't have any cancelled rides.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cancelledRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RideHistory;
