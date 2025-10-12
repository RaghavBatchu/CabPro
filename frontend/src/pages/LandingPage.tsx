import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Bell, Zap, Leaf, DollarSign, MapPin, Award, ChevronRight, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-carpool.jpg";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
// Link not needed when using Clerk modal buttons

const LandingPage = () => {
  // Show auth buttons only when user is signed out; using Clerk's useUser for auth state
  const { isSignedIn, user } = useUser();
  
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

  const benefits = [
    {
      icon: DollarSign,
      title: "Save Money",
      description: "Cut your commute costs by up to 70% by sharing rides with others on your route.",
      highlight: true
    },
    {
      icon: Leaf,
      title: "Reduce Emissions",
      description: "Lower your carbon footprint and contribute to a cleaner environment with every shared ride."
    },
    {
      icon: Zap,
      title: "Save Time",
      description: "Skip the parking hassle and use carpool lanes for faster commutes during rush hours."
    },
    {
      icon: Award,
      title: "Build Community",
      description: "Connect with like-minded commuters and build meaningful relationships in your area."
    },
    {
      icon: MapPin,
      title: "Flexible Routes",
      description: "Choose from multiple routes and schedules that fit perfectly with your lifestyle."
    },
    {
      icon: Users,
      title: "Verified Members",
      description: "All riders are verified for your peace of mind and a trustworthy carpooling experience."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Riders" },
    { number: "15M+", label: "Miles Shared" },
    { number: "$12M+", label: "Saved Together" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (!isSignedIn) {
      // open sign-in modal (fallback to sign-in route)
      window.location.href = '/sign-in';
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      navigate('/user-details');
      return;
    }

    try {
      // Use the lightweight exists check endpoint to decide where to go
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiBase}/api/users/exists/check?personalEmail=${encodeURIComponent(email)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data?.exists) {
          navigate('/dashboard');
        } else {
          navigate('/user-details');
        }
      } else {
        navigate('/user-details');
      }
    } catch (e) {
      console.error('exists check failed', e);
      navigate('/user-details');
    }
  };

  const handleLearnMore = () => {
    const el = document.getElementById('Why Choose CabPro?');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              CabPro
            </h1>
            <div className="flex items-center gap-3">
              {
                // Show user avatar when signed in; otherwise show modal sign in/up
              }
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
                    <Button variant="outline" size="sm">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal" fallbackRedirectUrl="/post-auth" forceRedirectUrl="/post-auth">
                    <Button size="sm">Sign Up</Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-background"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center md:text-left">
              <div>
                <span className="inline-block px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full text-sm font-semibold mb-4">
                  🚀 Join the Commuting Revolution
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Carpool Smarter with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  CabPro
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Save money, reduce traffic, help the planet, and build community. Join thousands of commuters making smarter travel choices every day.
              </p>
              <div className="flex gap-4 justify-center md:justify-start flex-wrap">
                <Button 
                  size="lg" 
                  className="text-lg px-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                  onClick={handleGetStarted}
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 border-2"
                  onClick={handleLearnMore}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-2xl opacity-30"></div>
              <div className="relative rounded-3xl h-96 flex items-center justify-center border border-blue-500/30 backdrop-blur overflow-hidden">
                <img src={heroImg} alt="Carpool hero" className="w-full h-full object-cover rounded-3xl shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div id="why-choose" className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose CabPro?
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of shared transportation with features designed for your safety, convenience, and savings.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className={`border-2 transition-all duration-300 hover:shadow-xl group cursor-pointer ${
                    (feature as any).highlight 
                      ? 'border-blue-500/50 bg-gradient-to-br from-blue-50 to-cyan-50' 
                      : 'border-border hover:border-blue-500/30'
                  }`}
                >
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
                      (feature as any).highlight
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-500'
                        : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                    }`}>
                      <Icon className={`w-7 h-7 ${(feature as any).highlight ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Benefits That Matter
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover how CabPro transforms your daily commute in multiple ways
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-border hover:border-blue-500/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                    benefit.highlight
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-500'
                      : 'bg-blue-500/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${benefit.highlight ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <h4 className="text-lg font-bold mb-2">{benefit.title}</h4>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-blue-500/30 bg-gradient-to-r from-blue-600/5 to-cyan-500/5 shadow-xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Ready to Transform Your Commute?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of commuters saving time, money, and the planet every single day.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-center gap-4 pb-8">
              <Button size="lg" className="text-lg px-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg" onClick={handleGetStarted}>
                Get Started Now <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 py-12">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
                CabPro
              </h3>
              <p className="text-sm text-muted-foreground">
                Making commutes smarter, cheaper, and more sustainable for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">How It Works</a></li>
                <li><a href="#" className="hover:text-foreground transition">Safety</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Trust & Safety</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; 2024 CabPro. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition">Twitter</a>
                <a href="#" className="hover:text-foreground transition">LinkedIn</a>
                <a href="#" className="hover:text-foreground transition">Facebook</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;