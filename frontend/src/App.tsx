import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import UserDetails from "./pages/UserDetails";
import Dashboard from "./pages/Dashboard";
import PostAuth from "./pages/PostAuth";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import RideHistory from "./pages/RideHistory";
import { Navigation } from "./components/Navbar";
import { SignedIn } from "@clerk/clerk-react";
import RequireProfile from "./components/RequireProfile";

const queryClient = new QueryClient();

// Get the Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-dvh">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/post-auth" element={<SignedIn><PostAuth /></SignedIn>} />
              <Route path="/user-details" element={<SignedIn><UserDetails /></SignedIn>} />
              <Route path="/dashboard" element={<SignedIn><><Navigation /><RequireProfile><Dashboard /></RequireProfile></></SignedIn>} />
              <Route path="/profile" element={<SignedIn><><Navigation /><RequireProfile><Profile /></RequireProfile></></SignedIn>} />
              <Route path="/reviews" element={<SignedIn><><Navigation /><RequireProfile><Reviews /></RequireProfile></></SignedIn>} />
              <Route path="/ride-history" element={<SignedIn><><Navigation /><RequireProfile><RideHistory /></RequireProfile></></SignedIn>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
