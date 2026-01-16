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
        const res = await fetch(`${API_BASE}/api/users/exists/check?personalEmail=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!data?.exists) {
          navigate("/user-details", { replace: true });
          return;
        }
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


