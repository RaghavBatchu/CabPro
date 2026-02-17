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
    rideType: "CAR" as "CAR" | "BIKE" | "AUTO" | "BUS",
    genderPreference: "ALL" as "ALL" | "MALE" | "FEMALE",
    totalSeats: 4,
    pricingType: "PER_HEAD" as "PER_HEAD" | "SHARED" | "FIXED",
    pricePerHead: "",
    basePrice: "",
    pricePerKm: "",
    estimatedDistanceKm: "",
    estimatedDurationMin: "",
  });

  const todayYmd = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  React.useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    console.log("CreateRideModal - Modal opened, user email:", email);
    
    if (isOpen && email) {
      const loadUserData = async () => {
        try {
          console.log("CreateRideModal - Fetching user data for:", email);
          const data = await fetchUserByEmail(email);
          console.log("CreateRideModal - User data loaded:", data);
          setUserData(data);
        } catch (error) {
          console.error("CreateRideModal - Failed to load user data:", error);
          toast.error("Failed to load user profile. Please try again.");
        }
      };
      loadUserData();
    } else {
      console.log("CreateRideModal - Not loading user data. isOpen:", isOpen, "email:", email);
    }
  }, [isOpen, user?.primaryEmailAddress?.emailAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== SUBMIT CLICKED ===");
    console.log("userData at submit time:", userData);
    console.log("userData?.id:", userData?.id);
    console.log("user email:", user?.primaryEmailAddress?.emailAddress);

    // Validate user data first - be more lenient
    if (!userData) {
      toast.error("User data not loaded. Please refresh and try again.");
      console.error("userData is missing:", userData);
      return;
    }

    // fetchUserByEmail returns an array, so get the first element
    const userObj = Array.isArray(userData) ? userData[0] : userData;
    
    // Get the user ID, try different possible property names
    const userId = userObj?.id || (userObj as any)?._id || (userObj as any)?.userId;
    
    if (!userId) {
      toast.error("User ID not found. Please refresh and try again.");
      console.error("Could not find user ID in:", userData);
      return;
    }

    console.log("Using user ID:", userId);

    // Validate required form fields
    if (!formData.origin || !formData.destination || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate pricing based on pricing type
    if (formData.pricingType === "PER_HEAD" && !formData.pricePerHead) {
      toast.error("Please enter price per head");
      return;
    }
    if (formData.pricingType === "FIXED" && !formData.basePrice) {
      toast.error("Please enter base price");
      return;
    }
    if (formData.pricingType === "SHARED" && !formData.pricePerKm) {
      toast.error("Please enter price per km");
      return;
    }

    try {
      setLoading(true);
      const payload: CreateRidePayload = {
        createdBy: userId,
        rideType: formData.rideType,
        origin: formData.origin,
        destination: formData.destination,
        rideDate: formData.date,
        rideTime: formData.time,
        totalSeats: formData.totalSeats,
        pricingType: formData.pricingType,
        genderPreference: formData.genderPreference,
      };

      // Add optional pricing fields based on pricing type
      if (formData.pricePerHead) {
        payload.pricePerHead = parseFloat(formData.pricePerHead);
      }
      if (formData.basePrice) {
        payload.basePrice = parseFloat(formData.basePrice);
      }
      if (formData.pricePerKm) {
        payload.pricePerKm = parseFloat(formData.pricePerKm);
      }

      // Add optional distance and duration estimates
      if (formData.estimatedDistanceKm) {
        payload.estimatedDistanceKm = parseFloat(formData.estimatedDistanceKm);
      }
      if (formData.estimatedDurationMin) {
        payload.estimatedDurationMin = parseInt(formData.estimatedDurationMin);
      }

      console.log("=== CREATE RIDE PAYLOAD ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("=== FORM DATA ===");
      console.log(JSON.stringify(formData, null, 2));

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
                  disablePast={formData.date === todayYmd}
                />
              </div>

              <div>
                <Label htmlFor="rideType">Ride Type *</Label>
                <Select
                  value={formData.rideType}
                  onValueChange={(value: "CAR" | "BIKE" | "AUTO" | "BUS") => 
                    setFormData(prev => ({ ...prev, rideType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Car</SelectItem>
                    <SelectItem value="BIKE">Bike</SelectItem>
                    <SelectItem value="AUTO">Auto</SelectItem>
                    <SelectItem value="BUS">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="genderPreference">Gender Preference</Label>
                <Select
                  value={formData.genderPreference}
                  onValueChange={(value: "ALL" | "MALE" | "FEMALE") => 
                    setFormData(prev => ({ ...prev, genderPreference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
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

              <div>
                <Label htmlFor="pricingType">Pricing Type *</Label>
                <Select
                  value={formData.pricingType}
                  onValueChange={(value: "PER_HEAD" | "SHARED" | "FIXED") => 
                    setFormData(prev => ({ ...prev, pricingType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PER_HEAD">Per Head</SelectItem>
                    <SelectItem value="SHARED">Shared (Per KM)</SelectItem>
                    <SelectItem value="FIXED">Fixed Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.pricingType === "PER_HEAD" && (
                <div>
                  <Label htmlFor="pricePerHead">Price Per Head *</Label>
                  <Input
                    id="pricePerHead"
                    type="number"
                    step="0.01"
                    value={formData.pricePerHead}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerHead: e.target.value }))}
                    placeholder="Enter price per head"
                  />
                </div>
              )}

              {formData.pricingType === "FIXED" && (
                <div>
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                    placeholder="Enter fixed price"
                  />
                </div>
              )}

              {formData.pricingType === "SHARED" && (
                <div>
                  <Label htmlFor="pricePerKm">Price Per KM *</Label>
                  <Input
                    id="pricePerKm"
                    type="number"
                    step="0.01"
                    value={formData.pricePerKm}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerKm: e.target.value }))}
                    placeholder="Enter price per km"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="estimatedDistanceKm">Estimated Distance (km)</Label>
                <Input
                  id="estimatedDistanceKm"
                  type="number"
                  step="0.1"
                  value={formData.estimatedDistanceKm}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDistanceKm: e.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label htmlFor="estimatedDurationMin">Estimated Duration (minutes)</Label>
                <Input
                  id="estimatedDurationMin"
                  type="number"
                  value={formData.estimatedDurationMin}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDurationMin: e.target.value }))}
                  placeholder="Optional"
                />
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

