import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UserDetails = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [personalEmail, setPersonalEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [gender, setGender] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user already exists, skip this page
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    const checkExisting = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/exists/check?personalEmail=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data?.exists) navigate("/dashboard", { replace: true });
      } catch {}
    };
    checkExisting();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, personalEmail, collegeEmail, whatsappNumber, gender }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to save user");
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{
        // Using a direct path avoids build-time import errors if the asset isn't present yet
        backgroundImage: "url('/src/assets/street-night.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-xl px-6">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Complete your profile</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm text-white/80">Full name</label>
              <input
                className="w-full rounded-lg px-4 py-2.5 bg-white/90 focus:bg-white outline-none border border-white/40 focus:border-white shadow-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-white/80">Personal email</label>
              <input
                type="email"
                className="w-full rounded-lg px-4 py-2.5 bg-white/90 focus:bg-white outline-none border border-white/40 focus:border-white shadow-sm"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-white/80">College email</label>
              <input
                type="email"
                className="w-full rounded-lg px-4 py-2.5 bg-white/90 focus:bg-white outline-none border border-white/40 focus:border-white shadow-sm"
                value={collegeEmail}
                onChange={(e) => setCollegeEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-white/80">WhatsApp number</label>
              <input
                className="w-full rounded-lg px-4 py-2.5 bg-white/90 focus:bg-white outline-none border border-white/40 focus:border-white shadow-sm"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-white/80">Gender</label>
              <select
                className="w-full rounded-lg px-4 py-2.5 bg-white/90 focus:bg-white outline-none border border-white/40 focus:border-white shadow-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {error && <p className="text-red-300 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-lg transition-colors"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;


