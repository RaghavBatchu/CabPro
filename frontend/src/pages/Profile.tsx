import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User as UserIcon, Mail, Phone, UserCircle } from "lucide-react";
import { fetchUserByEmail, updateUser as updateUserApi, createUser } from "@/services/userApi";
import { useUser as useClerkUser } from "@clerk/clerk-react";

// Local User type for profile form
interface User {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  gender: "Male" | "Female";
}

const Profile = () => {
  const [user, setUser] = useState<User>({
    id: "",
    fullName: "",
    email: "",
    whatsapp: "",
    gender: "Male",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user: clerkUser } = useClerkUser();

  const handleChange = (field: keyof User, value: string) => {
    setUser((prev: User) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!userId) throw new Error("User not loaded");
      const { fullName, email, whatsapp, gender } = user;
      const updated = await updateUserApi(userId, {
        fullName,
        collegeEmail: email,
        whatsappNumber: whatsapp,
        gender,
      });
      setUser({
        ...user,
        fullName: updated.fullName,
        email: updated.collegeEmail,
        whatsapp: updated.whatsappNumber,
        gender: updated.gender as "Male" | "Female",
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Load or create user from backend using personal email from Clerk
  useEffect(() => {
    const load = async () => {
      try {
        const personalEmail = clerkUser?.primaryEmailAddress?.emailAddress;
        const fullName = clerkUser?.fullName || clerkUser?.username || "";
        if (!personalEmail) return;

        let dto;
        try {
          const response = await fetchUserByEmail(personalEmail);
          // fetchUserByEmail returns an array, get the first element
          dto = Array.isArray(response) ? response[0] : response;
        } catch (err: any) {
          if (err?.status === 404) {
            dto = await createUser({
              fullName: fullName || "New User",
              personalEmail,
              collegeEmail: personalEmail, // using same unless you collect separately
              whatsappNumber: "",
              gender: "Male",
            });
          } else {
            throw err;
          }
        }

        setUser({
          fullName: dto.fullName,
          email: dto.collegeEmail,
          whatsapp: dto.whatsappNumber || "",
          gender: (dto.gender === "Male" || dto.gender === "Female" ? dto.gender : "Male"),
          id: dto.id,
        } as any);
        setUserId(dto.id);
      } catch (_e) {
        // ignore: keep empty UI if backend not available
      }
    };
    load();
  }, [clerkUser]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <Card className="ride-card">
        <CardHeader className="text-center border-b border-border pb-6">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{user.fullName}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Personal Details
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={user.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    disabled={!isEditing}
                    className="transition-[var(--transition-smooth)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    College Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="transition-[var(--transition-smooth)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={user.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    disabled={!isEditing}
                    className="transition-[var(--transition-smooth)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={user.gender}
                    onValueChange={(value: "Male" | "Female") =>
                      handleChange("gender", value)
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    className="btn-primary flex-1"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      toast.info("Changes discarded");
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  className="btn-primary flex-1"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
