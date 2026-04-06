import { z } from 'zod';

export const createRideSchema = z.object({
  body: z.object({
    // Must be a valid UUID
    createdBy: z.string().uuid({ message: "Invalid user ID format" }),
    
    // Must be one of the specific ride types
    rideType: z.enum(["CAR", "BIKE", "AUTO", "TEMPO"], {
      required_error: "Ride type is required",
    }),
    
    // Prevent empty strings and excessively long malicious payloads
    origin: z.string().min(2, "Origin is too short").max(255, "Origin is too long"),
    destination: z.string().min(2, "Destination is too short").max(255, "Destination is too long"),
    
    rideDate: z.string().min(1, "Ride date is required"),
    
    // Ensure time matches HH:MM format
    rideTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:MM"),
    
    // Ensure seats are positive and cap them to prevent database integer overflow or weird UI bugs
    totalSeats: z.number().int().min(1, "Must have at least 1 seat").max(10, "Cannot exceed 10 seats"),
    
    pricingType: z.enum(["PER_HEAD", "SHARED", "FIXED"]),
    
    // If provided, prices must be positive numbers
    pricePerHead: z.number().positive("Price must be greater than 0").optional(),
    basePrice: z.number().positive("Base price must be greater than 0").optional(),
    pricePerKm: z.number().positive("Price per km must be greater than 0").optional(),
    
    estimatedDistanceKm: z.number().positive().optional(),
    estimatedDurationMin: z.number().int().positive().optional(),
    
    genderPreference: z.enum(["ALL", "MALE", "FEMALE"]).optional().default("ALL"),
  })
});
