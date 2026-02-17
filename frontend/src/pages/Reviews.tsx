import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Shield, MessageSquare } from "lucide-react";

const Reviews = () => {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Reviews & Feedback</h1>
        <p className="text-muted-foreground">
          How our peer review system works
        </p>
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
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="ride-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
};

export default Reviews;
