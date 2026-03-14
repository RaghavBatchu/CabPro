import { PropsWithChildren, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const RequireProfile = ({ children }: PropsWithChildren) => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!isSignedIn) return;
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) {
        // email not available yet from Clerk - wait for authentication to populate user
        setChecking(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/users/by-email?personalEmail=${encodeURIComponent(email)}`);
        if (!res.ok) {
          // User doesn't exist, redirect to complete profile
          navigate("/user-details", { replace: true });
        }
        // If user exists (res.ok), allow them to continue to the page
      } catch (error) {
        // On error, assume user doesn't exist and redirect to complete profile
        navigate("/user-details", { replace: true });
      } finally {
        setChecking(false);
      }
    };
    run();
  }, [isSignedIn, user, navigate]);

  if (checking) return null;
  return <>{children}</>;
};

export default RequireProfile;


