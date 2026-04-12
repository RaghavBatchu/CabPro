import { useEffect, useRef } from "react";
import "./LandingPage.css";
import { Car, Users, Shield, Bell, DollarSign, Leaf, UsersRound, ArrowRight, Star, ChevronRight, UserCircle, MapPin, Clock } from "lucide-react";
import heroMockup from "@/assets/hero-mockup.png";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

/* ──────────────────────────── data ──────────────────────────── */

const features = [
  {
    icon: Users,
    emoji: "🤝",
    title: "Automated Ride Matching",
    description:
      "Smart algorithm pairs you with compatible co-riders heading the same way, at the same time.",
  },
  {
    icon: Shield,
    emoji: "🛡️",
    title: "Gender-Safe Groups",
    description:
      "Choose comfort preferences for safe rides. Ride only with people you're comfortable with.",
  },
  {
    icon: Bell,
    emoji: "🔔",
    title: "Real-time Notifications",
    description:
      "Instant alerts for ride confirmations, arrivals, and schedule changes — never miss a ride.",
  },
];

const benefits = [
  {
    icon: DollarSign,
    emoji: "💰",
    title: "Save Up to 60%",
    description: "Cut your daily commute costs dramatically by sharing rides with others on your route.",
  },
  {
    icon: Leaf,
    emoji: "🌱",
    title: "Reduce Carbon Footprint",
    description: "Every shared ride removes one more car from the road. Ride green, ride together.",
  },
  {
    icon: UsersRound,
    emoji: "👥",
    title: "Build Community",
    description: "Connect with like-minded commuters and turn boring rides into meaningful connections.",
  },
];



const steps = [
  {
    num: "01",
    icon: UserCircle,
    title: "Create your profile",
    description: "Sign up in seconds and set your route, schedule, and preferences.",
  },
  {
    num: "02",
    icon: MapPin,
    title: "Match with riders",
    description: "Our algorithm finds the best co-riders for your commute automatically.",
  },
  {
    num: "03",
    icon: Clock,
    title: "Ride & Save",
    description: "Share the ride, split costs, and enjoy a smarter commute every day.",
  },
];

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Software Engineer",
    rating: 5,
    quote: "CabPro cut my daily commute cost by half! The matching is incredibly accurate and I feel safe every ride.",
    avatar: "AS",
  },
  {
    name: "Rahul Menon",
    role: "Product Designer",
    rating: 5,
    quote: "I've been using CabPro for 6 months — it's seamless. The gender-safe groups feature is a game changer.",
    avatar: "RM",
  },
  {
    name: "Priya Patel",
    role: "Marketing Lead",
    rating: 4,
    quote: "Real-time notifications keep me on track. I've never missed a shared ride since I joined CabPro.",
    avatar: "PP",
  },
];

/* ──────────────────────────── component ──────────────────────────── */

const LandingPage = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  /* Intersection-observer driven reveal animations */
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("lp-visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    revealRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  /* Navigation helpers */
  const handleGetStarted = async () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) { navigate("/user-details"); return; }
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const res = await fetch(
        `${apiBase}/api/users/by-email?personalEmail=${encodeURIComponent(email)}`,
        { credentials: "include" },
      );
      navigate(res.ok ? "/dashboard" : "/user-details");
    } catch {
      navigate("/user-details");
    }
  };



  /* Stars helper */
  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
      />
    ));

  return (
    <div className="lp-root">
      {/* ─── NAVBAR ─── */}
      <nav className="lp-nav" id="lp-navbar">
        <div className="lp-nav-inner">
          <a href="/" className="lp-logo-link">
            <Car className="lp-logo-icon" />
            <span className="lp-logo-text">CabPro</span>
          </a>
          <div className="lp-nav-actions">
            {isSignedIn ? (
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            ) : (
              <>
                <SignInButton mode="modal" fallbackRedirectUrl="/post-auth" forceRedirectUrl="/post-auth">
                  <button className="lp-btn-ghost" id="lp-signin">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal" fallbackRedirectUrl="/post-auth" forceRedirectUrl="/post-auth">
                  <button className="lp-btn-pill" id="lp-signup">Sign Up</button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="lp-hero" id="lp-hero">
        {/* dot grid texture */}
        <div className="lp-hero-dots" aria-hidden />
        {/* gradient blobs */}
        <div className="lp-hero-blob lp-hero-blob--1" aria-hidden />
        <div className="lp-hero-blob lp-hero-blob--2" aria-hidden />

        <div className="lp-hero-inner">
          <div className="lp-hero-text" ref={addRevealRef}>
            <span className="lp-hero-badge">🚀 The Smarter Way to Commute</span>
            <h1 className="lp-hero-h1">
              Commute Smarter.<br />
              <span className="lp-gradient-text">Together.</span>
            </h1>
            <p className="lp-hero-sub">
              Save money, cut traffic, and make your daily ride enjoyable with verified co-riders.
            </p>
            <div className="lp-hero-ctas">
              <button className="lp-btn-primary" onClick={handleGetStarted} id="lp-hero-find">
                Find a Ride <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          </div>

          <div className="lp-hero-visual" ref={addRevealRef}>
            <div className="lp-hero-img-wrap">
              <img src={heroMockup} alt="CabPro app mockup showing a map with rider matches" className="lp-hero-img" />
            </div>
            {/* floating stat badges */}
            <div className="lp-float-badge lp-float-badge--1">🚗 50K+ Riders</div>
            <div className="lp-float-badge lp-float-badge--2">🌿 12M miles shared</div>
            <div className="lp-float-badge lp-float-badge--3">⭐ 4.9 rating</div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="lp-section" id="lp-features">
        <div className="lp-container">
          <div className="lp-section-header" ref={addRevealRef}>
            <h2 className="lp-section-title">Why CabPro?</h2>
            <p className="lp-section-sub">
              Built from the ground up for safe, smart, and social commuting.
            </p>
          </div>
          <div className="lp-features-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="lp-feature-card" ref={addRevealRef}>
                  <div className="lp-feature-icon-box">
                    <Icon className="lp-feature-icon" />
                  </div>
                  <h3 className="lp-feature-title">{f.emoji} {f.title}</h3>
                  <p className="lp-feature-desc">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="lp-section lp-section--alt" id="lp-benefits">
        <div className="lp-container">
          <div className="lp-section-header" ref={addRevealRef}>
            <h2 className="lp-section-title">Benefits That Matter</h2>
            <p className="lp-section-sub">
              More than just a ride — it's a smarter lifestyle.
            </p>
          </div>
          <div className="lp-features-grid">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="lp-feature-card" ref={addRevealRef}>
                  <div className="lp-feature-icon-box lp-feature-icon-box--teal">
                    <Icon className="lp-feature-icon" />
                  </div>
                  <h3 className="lp-feature-title">{b.emoji} {b.title}</h3>
                  <p className="lp-feature-desc">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="lp-section" id="lp-how">
        <div className="lp-container">
          <div className="lp-section-header" ref={addRevealRef}>
            <h2 className="lp-section-title">How It Works</h2>
            <p className="lp-section-sub">Three simple steps to a better commute.</p>
          </div>
          <div className="lp-steps-grid">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="lp-step-card" ref={addRevealRef}>
                  <span className="lp-step-num">{s.num}</span>
                  <div className="lp-step-icon-wrap">
                    <Icon className="lp-step-icon" />
                  </div>
                  <h3 className="lp-step-title">{s.title}</h3>
                  <p className="lp-step-desc">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="lp-section lp-section--alt" id="lp-testimonials">
        <div className="lp-container">
          <div className="lp-section-header" ref={addRevealRef}>
            <h2 className="lp-section-title">What Riders Say</h2>
            <p className="lp-section-sub">
              Join thousands of happy commuters already on CabPro.
            </p>
          </div>
          <div className="lp-testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="lp-testimonial-card" ref={addRevealRef}>
                <div className="lp-testimonial-top">
                  <div className="lp-testimonial-avatar">{t.avatar}</div>
                  <div>
                    <p className="lp-testimonial-name">{t.name}</p>
                    <p className="lp-testimonial-role">{t.role}</p>
                  </div>
                </div>
                <div className="lp-testimonial-stars">{renderStars(t.rating)}</div>
                <p className="lp-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="lp-cta-banner" id="lp-cta" ref={addRevealRef}>
        <div className="lp-container lp-cta-inner">
          <h2 className="lp-cta-title">Ready to Transform Your Commute?</h2>
          <p className="lp-cta-sub">
            Join 50,000+ riders saving time, money, and the planet every single day.
          </p>
          <button className="lp-cta-btn" onClick={handleGetStarted} id="lp-cta-start">
            Get Started Now <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="lp-footer" id="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <div className="lp-logo-link" style={{color:"#fff"}}>
                <Car className="lp-logo-icon" style={{color:"#c084fc"}} />
                <span className="lp-logo-text" style={{color:"#ffffff"}}>CabPro</span>
              </div>
              <p className="lp-footer-tagline">
                Making commutes smarter, cheaper, and more sustainable for everyone.
              </p>
            </div>
            <div className="lp-footer-col">
              <h4 className="lp-footer-heading">Product</h4>
              <ul className="lp-footer-links">
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Safety</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h4 className="lp-footer-heading">Company</h4>
              <ul className="lp-footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h4 className="lp-footer-heading">Legal</h4>
              <ul className="lp-footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Trust & Safety</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>&copy; {new Date().getFullYear()} CabPro. All rights reserved.</p>
            <div className="lp-footer-social">
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
              <a href="#">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;