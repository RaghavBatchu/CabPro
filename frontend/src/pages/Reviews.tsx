import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Users, Shield, MessageSquare, Car, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchRideById } from "../services/rideApi";
import { fetchUserByEmail } from "../services/userApi";
import { submitRideReviews, RideReviewPayload } from "../services/reviewApi";

interface ReviewCandidate {
  id: string; // userId
  name: string;
  role: "Leader" | "Co-Passenger";
  rating: number; // 0 for unrated
  comment: string;
}

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <Card className="ride-card hover:shadow-lg transition-shadow">
    <CardContent className="pt-6">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Reviews = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const rideId = searchParams.get("rideId");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<ReviewCandidate[]>([]);
  const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [rideRating, setRideRating] = useState(0);
  const [rideComment, setRideComment] = useState("");

  // Features for info page
  const features = [
    {
      icon: Users,
      title: "Ride-Specific Reviews",
      description: "Reviews are collected after each completed ride to ensure authentic feedback from participants."
    },
    {
      icon: Star,
      title: "Rating System",
      description: "Rate your fellow riders on safety, punctuality, and overall experience after completing a ride together."
    },
    {
      icon: Shield,
      title: "Build Trust",
      description: "Your ratings and reviews help build a trustworthy community and help others make informed decisions."
    },
    {
      icon: MessageSquare,
      title: "Feedback Loop",
      description: "Share detailed feedback to help improve the riding experience for everyone in the community."
    }
  ];

  useEffect(() => {
    const init = async () => {
      if (!isLoaded || !user || !rideId) return;

      try {
        setLoading(true);

        // 1. Fetch current user DB ID
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) throw new Error("No email found for user");
        
        const userData = await fetchUserByEmail(email);
        const userObj = Array.isArray(userData) ? userData[0] : userData;
        if (!userObj?.id) throw new Error("User not found in database");
        setCurrentUserDbId(userObj.id);

        // 2. Fetch ride details
        const ride = await fetchRideById(rideId);
        setRideDetails(ride);

        // 3. Prepare candidates
        const candidatesList: ReviewCandidate[] = [];
        const myId = userObj.id;
        const isLeader = ride.createdBy === myId;
        
        // Find my status
        const myRecord = ride.participants?.find((p: any) => p.id === myId);
        const myStatus = myRecord?.status;

        // Add Leader to candidates (if I am not leader)
        if (!isLeader) {
             candidatesList.push({
               id: ride.createdBy,
               name: ride.leaderName || "Ride Leader",
               role: "Leader",
               rating: 0,
               comment: ""
             });
        }

        // Add Participants (Accepted or Cancelled)
        // Only if I was also a participant (Accepted/Cancelled) or Leader
        const amIParticipant = ["ACCEPTED", "CANCELLED"].includes(myStatus);
        const showParticipants = isLeader || amIParticipant;

        if (showParticipants && ride.participants && Array.isArray(ride.participants)) {
             ride.participants.forEach((p: any) => {
                 if (p.id !== myId && ["ACCEPTED", "CANCELLED"].includes(p.status)) {
                     candidatesList.push({
                         id: p.id,
                         name: p.fullName || "Co-Passenger",
                         role: "Co-Passenger",
                         rating: 0,
                         comment: ""
                     });
                 }
             });
        }
        
        setCandidates(candidatesList);

      } catch (error: any) {
        console.error("Error loading review context:", error);
        toast.error("Failed to load ride details for review.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isLoaded, user, rideId]);

  const handleRatingChange = (candidateId: string, rating: number) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, rating } : c
    ));
  };

  const handleCommentChange = (candidateId: string, comment: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, comment } : c
    ));
  };

  const handleSubmit = async () => {
    if (!rideId || !currentUserDbId) return;
    
    // Validate: At least one rating provided? Or all must be rated?
    // Let's require rating for selected candidates if user interacted?
    // Or just submit valid ones. 
    // Usually user should rate everyone visible, or skip.
    // Let's filter out unrated ones (rating === 0).

    const reviewsToSubmit = candidates.filter(c => c.rating > 0).map(c => ({
      reviewedUserId: c.id,
      rating: c.rating,
      comment: c.comment
    }));

    if (reviewsToSubmit.length === 0 && rideRating === 0) {
      toast.warning("Please rate at least one person or the ride itself.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: RideReviewPayload = {
        rideId,
        reviewerId: currentUserDbId,
        reviews: reviewsToSubmit,
        rideReview: rideRating > 0 ? { rating: rideRating, comment: rideComment } : undefined
      };

      await submitRideReviews(payload);
      toast.success("Reviews submitted successfully!");
      navigate('/ride-history'); // Go back to history
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit reviews.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Info Page Mode (No rideId)
  if (!rideId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reviews & Feedback</h1>
          <p className="text-muted-foreground">How our peer review system works</p>
        </div>

        <Card className="ride-card mb-6">
          <CardHeader>
            <CardTitle>About Ride Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground mb-4">
              CabPro uses a ride-based review system where you can rate and review your fellow passengers 
              after completing a ride together. This helps build trust and ensures a safe, reliable 
              ridesharing experience for everyone.
            </p>
            <p className="text-card-foreground">
              <strong>When can you submit reviews?</strong> After each completed ride, you'll have the 
              opportunity to rate other participants. Reviews are tied to specific rides and can only be 
              submitted by actual participants.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        <Card className="ride-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">How to Submit a Review</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Complete a ride as either a leader or participant</li>
                  <li>Navigate to your ride history</li>
                  <li>Select the completed ride you want to review</li>
                  <li>Rate each participant on a scale of 1-5 stars</li>
                  <li>Add optional comments to provide context</li>
                  <li>Submit your review to help build community trust</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Loading State
  if (loading || !rideDetails) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading ride details and participants...</p>
      </div>
    );
  }

  // 3. Review Submission Form
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Rate Your Experience</h1>
        <p className="text-muted-foreground">
           Ride from <span className="font-medium">{rideDetails.origin}</span> to <span className="font-medium">{rideDetails.destination}</span>
        </p>
      </div>

      {candidates.length === 0 ? (
        <Card className="mb-6">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p>There is no one to review for this ride.</p>
                <p className="text-sm mt-2">(You cannot review yourself, and there were no other accepted participants.)</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/ride-history')}>
                    Back to History
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="ride-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{candidate.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                        {candidate.role === "Leader" ? <Car className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {candidate.role}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(candidate.id, star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                          title={`${star} stars`}
                        >
                            <Star 
                                className={`h-6 w-6 ${
                                    star <= candidate.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`} 
                            />
                        </button>
                     ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea 
                    placeholder={`Describe your experience with ${candidate.name} (optional)...`}
                    value={candidate.comment}
                    onChange={(e) => handleCommentChange(candidate.id, e.target.value)}
                    className="resize-none"
                    rows={2}
                />
              </CardContent>
            </Card>
          ))}
        
          <Card className="ride-card border-l-4 border-l-primary/50">
             <CardHeader className="pb-3">
                 <div className="flex items-center justify-between">
                     <div>
                         <CardTitle className="text-lg">Overall Ride Experience</CardTitle>
                         <CardDescription className="flex items-center gap-1 mt-1">
                             <Car className="h-3 w-3" />
                             Rate the ride itself
                         </CardDescription>
                     </div>
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRideRating(star)}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                title={`${star} stars`}
                            >
                                <Star 
                                    className={`h-6 w-6 ${
                                        star <= rideRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    }`} 
                                />
                            </button>
                        ))}
                     </div>
                 </div>
             </CardHeader>
             <CardContent>
                 <Textarea 
                     placeholder="How was the ride? (Cleanliness, route, timing, etc.)"
                     value={rideComment}
                     onChange={(e) => setRideComment(e.target.value)}
                     className="resize-none"
                     rows={2}
                 />
             </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate('/ride-history')}>
                Cancel
            </Button>
            <Button 
                onClick={handleSubmit} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={submitting || (candidates.every(c => c.rating === 0) && rideRating === 0)}
            >
                {submitting ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                    </>
                ) : (
                    "Submit Reviews"
                )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
