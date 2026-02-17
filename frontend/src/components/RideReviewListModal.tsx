import React, { useEffect, useState } from "react";
import { X, Star, User, Car, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getRideReviews } from "@/services/reviewApi";

interface RideReviewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string | null;
}

export const RideReviewListModal: React.FC<RideReviewListModalProps> = ({
  isOpen,
  onClose,
  rideId,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && rideId) {
      setLoading(true);
      getRideReviews(rideId)
        .then((res) => setData(res))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, rideId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b py-4">
          <CardTitle>Ride Reviews</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* 1. Ride Experience Reviews */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-500" />
                  Ride Experience
                </h3>
                {!data?.rideReviews?.length ? (
                  <p className="text-sm text-muted-foreground italic">
                    No reviews for the ride itself.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.rideReviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="bg-secondary/20 p-3 rounded-lg border"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">
                            {review.reviewerName}
                          </span>
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Participant Reviews */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  Participant Reviews
                </h3>
                {!data?.userReviews?.length ? (
                  <p className="text-sm text-muted-foreground italic">
                    No participant reviews submitted.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.userReviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="bg-secondary/20 p-3 rounded-lg border"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              From {review.reviewerName} to
                            </span>
                            <span className="font-medium text-sm">
                              {review.reviewedName}
                            </span>
                          </div>
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/20 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
};
