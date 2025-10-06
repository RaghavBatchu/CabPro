export interface Ride {
    id: string;
    driverName: string;
    driverId: string;
    destination: string;
    time: string;
    availableSeats: number;
    totalSeats: number;
    genderPreference: "Male" | "Female" | "Any";
    participants: string[];
    phone: string;
  }
  
  export interface User {
    id: string;
    fullName: string;
    email: string;
    whatsapp: string;
    gender: "Male" | "Female";
    avatar?: string;
  }
  
  export interface Review {
    id: string;
    rideId: string;
    reviewerName: string;
    rating: number;
    comment: string;
    date: string;
  }
  
  export const mockUser: User = {
    id: "user1",
    fullName: "Alex Johnson",
    email: "alex.johnson@college.edu",
    whatsapp: "+1234567890",
    gender: "Male",
  };
  
  export const mockRides: Ride[] = [
    {
      id: "ride1",
      driverName: "Sarah Williams",
      driverId: "driver1",
      destination: "Downtown Campus",
      time: "08:00 AM",
      availableSeats: 2,
      totalSeats: 4,
      genderPreference: "Any",
      participants: ["user1"],
      phone: "+1234567891",
    },
    {
      id: "ride2",
      driverName: "Mike Chen",
      driverId: "driver2",
      destination: "North Library",
      time: "09:30 AM",
      availableSeats: 1,
      totalSeats: 3,
      genderPreference: "Male",
      participants: [],
      phone: "+1234567892",
    },
    {
      id: "ride3",
      driverName: "Emily Davis",
      driverId: "driver3",
      destination: "South Dorms",
      time: "02:00 PM",
      availableSeats: 3,
      totalSeats: 4,
      genderPreference: "Female",
      participants: [],
      phone: "+1234567893",
    },
    {
      id: "ride4",
      driverName: "Alex Johnson",
      driverId: "user1",
      destination: "Airport",
      time: "06:00 PM",
      availableSeats: 4,
      totalSeats: 4,
      genderPreference: "Any",
      participants: ["driver4", "driver5"],
      phone: "+1234567890",
    },
    {
      id: "ride5",
      driverName: "Jessica Lee",
      driverId: "driver5",
      destination: "Shopping Mall",
      time: "11:00 AM",
      availableSeats: 0,
      totalSeats: 3,
      genderPreference: "Any",
      participants: ["user2", "user3", "user4"],
      phone: "+1234567894",
    },
    {
      id: "ride6",
      driverName: "David Martinez",
      driverId: "driver6",
      destination: "Downtown Campus",
      time: "07:30 AM",
      availableSeats: 2,
      totalSeats: 4,
      genderPreference: "Male",
      participants: ["user5"],
      phone: "+1234567895",
    },
  ];
  
  export const mockReviews: Review[] = [
    {
      id: "review1",
      rideId: "ride1",
      reviewerName: "John Doe",
      rating: 5,
      comment: "Great ride! Very punctual and friendly driver.",
      date: "2024-10-05",
    },
    {
      id: "review2",
      rideId: "ride2",
      reviewerName: "Jane Smith",
      rating: 4,
      comment: "Good experience, smooth ride to campus.",
      date: "2024-10-04",
    },
    {
      id: "review3",
      rideId: "ride1",
      reviewerName: "Bob Wilson",
      rating: 5,
      comment: "Excellent service! Clean car and safe driving.",
      date: "2024-10-03",
    },
    {
      id: "review4",
      rideId: "ride3",
      reviewerName: "Alice Brown",
      rating: 3,
      comment: "Decent ride but was 10 minutes late.",
      date: "2024-10-02",
    },
    {
      id: "review5",
      rideId: "ride4",
      reviewerName: "Charlie Green",
      rating: 5,
      comment: "Perfect! Would ride again.",
      date: "2024-10-01",
    },
  ];
  