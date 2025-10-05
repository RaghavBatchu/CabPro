import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Bell } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-carpool.jpg";

const LandingPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Users,
      title: "Automated Ride Matching",
      description: "Our smart algorithm connects you with compatible riders on similar routes, saving time and money."
    },
    {
      icon: Shield,
      title: "Gender-Safe Groups",
      description: "Choose your comfort level with customizable preferences for safe and secure carpooling experiences."
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Stay updated with instant alerts about ride confirmations, driver arrivals, and schedule changes."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CabPro
            </h1>
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              ) : (
                <>
                  <SignInButton mode="modal" fallbackRedirectUrl="/post-auth" forceRedirectUrl="/post-auth">
                    <Button variant="outline" size="default">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal" fallbackRedirectUrl="/post-auth" forceRedirectUrl="/post-auth">
                    <Button variant="default" size="default">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                Carpool Smarter with{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  CabPro
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl">
                Save money, reduce traffic, and ride together. Join thousands of commuters making smarter travel choices every day.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                {isSignedIn ? (
                  <Button 
                    size="lg" 
                    className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <SignUpButton mode="modal" fallbackRedirectUrl="/post-auth" forceRedirectUrl="/post-auth">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Get Started
                    </Button>
                  </SignUpButton>
                )}
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-3xl blur-3xl opacity-20"></div>
              <img 
                src={heroImage} 
                alt="People carpooling together" 
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose CabPro?
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of shared transportation with features designed for your safety and convenience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Ready to Start Carpooling?
              </CardTitle>
              <CardDescription className="text-lg">
                Join CabPro today and make your commute smarter, cheaper, and more sustainable.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              {isSignedIn ? (
                <Button size="lg" className="text-lg px-12" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              ) : (
                <SignUpButton mode="modal" fallbackRedirectUrl="/post-auth" forceRedirectUrl="/post-auth">
                  <Button size="lg" className="text-lg px-12">
                    Sign Up Now
                  </Button>
                </SignUpButton>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 CabPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;