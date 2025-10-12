import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const PostAuth = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      // email not loaded yet from Clerk - wait for user object to populate
      return;
    }
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/exists/check?personalEmail=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error("Failed to check user");
        const data = await res.json();
        if (data?.exists) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/user-details", { replace: true });
        }
      } catch {
        navigate("/user-details", { replace: true });
      }
    };
    check();
  }, [isSignedIn, user, navigate]);

  return null;
};

export default PostAuth;


