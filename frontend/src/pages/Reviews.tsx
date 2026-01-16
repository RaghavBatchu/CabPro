import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fetchReviews, createReview, Review, fetchIssueReports } from "@/services/reviewApi";
import { fetchUserByEmail } from "@/services/userApi";
import { useUser } from "@clerk/clerk-react";

const Reviews = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [issueReports, setIssueReports] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    rating: 0,
    comment: "",
  });

  // Load reviews from backend
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const [reviewsData, issuesData] = await Promise.all([
          fetchReviews(),
          fetchIssueReports(),
        ]);
        const regularReviews = reviewsData.reviews.filter((r: Review) => !r.isIssueReport);
        setReviews(regularReviews);
        setIssueReports(issuesData.issues);
        setAverageRating(parseFloat(reviewsData.average));
        setTotalReviews(regularReviews.length);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  // Auto-populate user name
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.primaryEmailAddress?.emailAddress) {
        try {
          const userData = await fetchUserByEmail(user.primaryEmailAddress.emailAddress);
          setNewReview(prev => ({ ...prev, reviewerName: userData.fullName }));
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      }
    };
    loadUserData();
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.reviewerName || newReview.rating === 0 || !newReview.comment) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        name: newReview.reviewerName,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      
      // Refresh reviews to get updated data
      const data = await fetchReviews();
      const regularReviews = data.reviews.filter((r: Review) => !r.isIssueReport);
      setReviews(regularReviews);
      setAverageRating(parseFloat(data.average));
      setTotalReviews(regularReviews.length);
      
      setNewReview({ reviewerName: "", rating: 0, comment: "" });
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    interactive = false,
    onRate,
  }: {
    rating: number;
    interactive?: boolean;
    onRate?: (rating: number) => void;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-5 w-5 transition-all duration-200",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300",
              interactive && "cursor-pointer hover:scale-110 hover:text-yellow-300"
            )}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Reviews</h1>
        <p className="text-muted-foreground">
          Read and share experiences from the community
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews">
            Reviews ({totalReviews})
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues ({issueReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="ride-card md:col-span-1 bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(averageRating)} />
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {totalReviews} reviews
                </p>
              </CardContent>
            </Card>

            <Card className="ride-card md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewerName">Your Name</Label>
                    <Input
                      id="reviewerName"
                      value={newReview.reviewerName}
                      onChange={(e) =>
                        setNewReview({ ...newReview, reviewerName: e.target.value })
                      }
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <StarRating
                      rating={newReview.rating}
                      interactive
                      onRate={(rating) => setNewReview({ ...newReview, rating })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      placeholder="Share your experience..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="btn-primary w-full" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">All Reviews</h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <Card key={review._id} className="ride-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {review.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-card-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Reported Issues
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading issues...</p>
              </div>
            ) : issueReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No issues reported yet.</p>
              </div>
            ) : (
              issueReports.map((issue) => (
                <Card key={issue._id} className="ride-card border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          {issue.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-card-foreground bg-white p-3 rounded border border-red-200">
                      {issue.comment}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reviews;
