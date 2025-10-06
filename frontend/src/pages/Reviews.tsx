import { useState } from "react";
import { mockReviews, Review } from "@/components/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    rating: 0,
    comment: "",
  });

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.reviewerName && newReview.rating > 0 && newReview.comment) {
      const review: Review = {
        id: `review${reviews.length + 1}`,
        rideId: "ride1",
        reviewerName: newReview.reviewerName,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split("T")[0],
      };
      setReviews([review, ...reviews]);
      setNewReview({ reviewerName: "", rating: 0, comment: "" });
      toast.success("Review submitted successfully!");
    } else {
      toast.error("Please fill in all fields");
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
              "h-5 w-5 transition-[var(--transition-smooth)]",
              star <= rating
                ? "fill-secondary text-secondary"
                : "fill-none text-muted-foreground",
              interactive && "cursor-pointer hover:scale-110"
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

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="ride-card md:col-span-1 bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="text-5xl font-bold text-primary mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="text-sm text-muted-foreground mt-2">
              Based on {reviews.length} reviews
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

              <Button type="submit" className="btn-primary w-full">
                Submit Review
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">All Reviews</h2>
        {reviews.map((review) => (
          <Card key={review.id} className="ride-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {review.reviewerName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-card-foreground">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
