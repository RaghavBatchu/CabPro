import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, Trash2, Car, Users, RefreshCw, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { fetchRideHistory, deleteHistoryEntry, categorizeRides, isRideDatePassed, backfillHistory, HistoryEntry } from "@/services/historyApi";
import { fetchUserByEmail } from "@/services/userApi";

const RideHistory = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("current");
  const [userData, setUserData] = useState<any>(null);

  // Load user data to get the correct user ID
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.primaryEmailAddress?.emailAddress) {
        try {
          const data = await fetchUserByEmail(user.primaryEmailAddress.emailAddress);
          console.log("Loaded user data:", data);
          setUserData(data);
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      }
    };
    loadUserData();
  }, [user]);

  // Fetch ride history
  const { data: history, isLoading, error } = useQuery({
    queryKey: ["rideHistory", userData?._id],
    queryFn: () => {
      console.log("Fetching history for user ID:", userData?._id);
      return fetchRideHistory(userData?._id || "");
    },
    enabled: !!userData?._id,
  });

  // Delete history entry mutation
  const deleteMutation = useMutation({
    mutationFn: deleteHistoryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rideHistory"] });
      toast.success("History entry deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete history entry");
      console.error("Delete error:", error);
    },
  });

  // Backfill history mutation
  const backfillMutation = useMutation({
    mutationFn: () => backfillHistory(userData?._id || ""),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rideHistory"] });
      toast.success(`Backfilled ${data.entries.length} history entries`);
    },
    onError: (error: any) => {
      toast.error("Failed to backfill history");
      console.error("Backfill error:", error);
    },
  });

  // Categorize rides into current and past
  const categorizedRides = history ? categorizeRides(history) : { current: [], past: [] };

  const handleDelete = (historyId: string) => {
    if (window.confirm("Are you sure you want to delete this history entry?")) {
      deleteMutation.mutate(historyId);
    }
  };

  const handleBackfill = () => {
    if (window.confirm("This will add all your existing rides to history. Continue?")) {
      backfillMutation.mutate();
    }
  };

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

  const getStatusColor = (status: string, date: string) => {
    if (status === "cancelled") return "destructive";
    if (isRideDatePassed(date)) return "secondary";
    return "default";
  };

  const getStatusText = (status: string, date: string) => {
    if (status === "cancelled") return "Cancelled";
    if (isRideDatePassed(date)) return "Completed";
    return "Upcoming";
  };

  const RideCard = ({ ride }: { ride: HistoryEntry }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {ride.role === "driver" ? (
                <Car className="h-4 w-4 text-blue-600" />
              ) : (
                <Users className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm font-medium capitalize">{ride.role}</span>
            </div>
            <Badge variant={getStatusColor(ride.status, ride.date)}>
              {getStatusText(ride.status, ride.date)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(ride._id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              <span className="font-medium">{ride.origin}</span> →{" "}
              <span className="font-medium">{ride.destination}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{formatDate(ride.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{formatTime(ride.time)}</span>
          </div>
          
           <div className="flex items-center gap-2">
             <User className="h-4 w-4 text-gray-500" />
             <span className="text-sm">Ride Leader: {ride.driverName}</span>
           </div>
           
           {ride.participantsInfo && ride.participantsInfo.length > 0 && (
             <div className="flex items-start gap-2">
               <UserCheck className="h-4 w-4 text-gray-500 mt-0.5" />
               <div className="text-sm">
                 <span className="text-gray-500">Participants: </span>
                 <span className="font-medium">
                   {ride.participantsInfo.map(p => p.fullName).join(", ")}
                 </span>
               </div>
             </div>
           )}
         </div>
       </CardContent>
     </Card>
   );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ride history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading History</h2>
          <p className="text-gray-600">Failed to load your ride history. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ride History</h1>
            <p className="text-gray-600">
              View your current and past rides. Past rides are automatically marked as completed.
            </p>
          </div>
          <Button
            onClick={handleBackfill}
            disabled={backfillMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${backfillMutation.isPending ? 'animate-spin' : ''}`} />
            {backfillMutation.isPending ? 'Backfilling...' : 'Sync Existing Rides'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">
            Current Rides ({categorizedRides.current.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Rides ({categorizedRides.past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          {categorizedRides.current.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Rides</h3>
              <p className="text-gray-600">You don't have any upcoming rides.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorizedRides.current.map((ride) => (
                <RideCard key={ride._id} ride={ride} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {categorizedRides.past.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Rides</h3>
              <p className="text-gray-600">You don't have any completed rides yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorizedRides.past.map((ride) => (
                <RideCard key={ride._id} ride={ride} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RideHistory;
