import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createRide, CreateRidePayload } from "@/services/rideApi";
import { useUser } from "@clerk/clerk-react";
import { fetchUserByEmail } from "@/services/userApi";

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRideCreated: () => void;
  initialFilters?: {
    origin?: string;
    destination?: string;
    date?: string;
    time?: string;
  };
}

export const CreateRideModal: React.FC<CreateRideModalProps> = ({
  isOpen,
  onClose,
  onRideCreated,
  initialFilters = {},
}) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    origin: initialFilters.origin || "",
    destination: initialFilters.destination || "",
    date: initialFilters.date || "",
    time: initialFilters.time || "",
    genderPreference: "All" as "All" | "Male" | "Female",
    totalSeats: 4,
    phone: "",
  });

  React.useEffect(() => {
    if (isOpen && user?.primaryEmailAddress?.emailAddress) {
      const loadUserData = async () => {
        try {
          const data = await fetchUserByEmail(user.primaryEmailAddress.emailAddress);
          setUserData(data);
          setFormData(prev => ({
            ...prev,
            phone: data.whatsappNumber || "",
          }));
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      };
      loadUserData();
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData || !user?.primaryEmailAddress?.emailAddress) {
      toast.error("User data not available");
      return;
    }

    if (!formData.origin || !formData.destination || !formData.date || !formData.time || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const payload: CreateRidePayload = {
        driverId: userData._id,
        driverName: userData.fullName,
        driverPhone: formData.phone,
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        time: formData.time,
        genderPreference: formData.genderPreference,
        totalSeats: formData.totalSeats,
      };

      await createRide(payload);
      toast.success("Ride created successfully! You are now the ride leader.");
      onRideCreated();
      onClose();
    } catch (error: any) {
      console.error("Failed to create ride:", error);
      toast.error(error.message || "Failed to create ride");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New Ride</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">From *</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="Enter origin location"
                  required
                />
              </div>

              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Enter destination"
                  required
                />
              </div>

              <div>
                <Label>Date *</Label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  placeholder="Select date"
                />
              </div>

              <div>
                <Label>Time *</Label>
                <TimePicker
                  value={formData.time}
                  onChange={(time) => setFormData(prev => ({ ...prev, time }))}
                  placeholder="Select time"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="genderPreference">Gender Preference</Label>
                <Select
                  value={formData.genderPreference}
                  onValueChange={(value: "All" | "Male" | "Female") => 
                    setFormData(prev => ({ ...prev, genderPreference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="totalSeats">Total Seats</Label>
                <Select
                  value={formData.totalSeats.toString()}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, totalSeats: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Ride"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

