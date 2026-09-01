import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Mail, FileText, Image, Save, Heart, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import api, { getTopMatches } from "../services/api";
import MatchCard from "../components/MatchCard";

const formatMutualMatchForCard = (match) => {
  const profile = match.user;
  return {
    userId: profile.id,
    name: `${profile.firstName} ${profile.lastName || ""}`.trim(),
    age: profile.birthDate
      ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear()
      : null,
    photoUrl: profile.profileImageUrl,
    score: match.score,
    isMutualMatch: true,
    city: profile.city,
  };
};

const UserProfile = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [topMatches, setTopMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    profileImageUrl: "",
  });

  const loadTopMatches = useCallback(async () => {
    setMatchesLoading(true);
    try {
      try {
        const response = await getTopMatches(3);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setTopMatches(response.data);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch top matches:", err);
      }

      try {
        const matchesRes = await api.get("/users/matches");
        if (Array.isArray(matchesRes.data) && matchesRes.data.length > 0) {
          setTopMatches(matchesRes.data.map(formatMutualMatchForCard));
          return;
        }
      } catch (err) {
        console.error("Failed to fetch mutual matches:", err);
      }

      setTopMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      const profile = await refreshUser();
      if (cancelled) return;

      const data = profile || user;
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        profileImageUrl: data.profileImageUrl || "",
      });

      const isComplete = Boolean(data.profileComplete);
      setProfileComplete(isComplete);

      if (isComplete) {
        await loadTopMatches();
      } else {
        setTopMatches([]);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id, navigate, refreshUser, loadTopMatches]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("=== SUBMITTING PROFILE UPDATE ===");
      console.log("Form data:", formData);

      // Make actual API call to backend
      const response = await api.patch("/users/me/profile", formData);

      console.log("API Response:", response.data);

      // Update local context with response from server
      updateUser(response.data);

      toast.success("Profile updated successfully!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#F0FDF4",
          color: "#16A34A",
          fontWeight: "500",
          borderRadius: "10px",
          padding: "12px 20px",
          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.15)",
        },
        iconTheme: {
          primary: "#16A34A",
          secondary: "#F0FDF4",
        },
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      console.error("Error response:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile. Please try again.",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#FEF2F2",
            color: "#DC2626",
            fontWeight: "500",
            borderRadius: "10px",
            padding: "12px 20px",
          },
        },
      );

      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 px-4 py-28">
      <Toaster />

      <motion.div
        className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-pink-100"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
            <User className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h2>
          <p className="text-gray-600 text-sm">
            Update your profile information
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {formData.profileImageUrl ? (
            <img
              src={formData.profileImageUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-pink-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center border-4 border-pink-300">
              <User size={48} className="text-pink-600" />
            </div>
          )}
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                First Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Last Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Email (Read-only)
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Bio
            </label>
            <div className="relative">
              <FileText
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Profile Image URL
            </label>
            <div className="relative">
              <Image
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <input
                type="url"
                name="profileImageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.profileImageUrl}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-pink-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            <Save size={20} />
            <span>{isLoading ? "Saving..." : "Save Changes"}</span>
          </motion.button>

          {user.profileComplete && (
            <Link
              to="/onboarding?edit=true"
              className="w-full py-4 border-2 border-pink-300 text-pink-600 text-lg font-bold rounded-xl hover:bg-pink-50 transition flex items-center justify-center space-x-2"
            >
              <Pencil size={20} />
              <span>Edit Matching Profile</span>
            </Link>
          )}
        </motion.form>

        {/* Top Matches Widget */}
        <div className="mt-10 pt-8 border-t border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Heart className="text-pink-500" size={22} />
              Your Top Matches
            </h3>
            {user.profileComplete && (
              <Link
                to="/matches"
                className="text-sm text-pink-600 font-semibold hover:text-pink-700"
              >
                See all
              </Link>
            )}
          </div>

          {!profileComplete ? (
            <div className="text-center py-6 bg-pink-50 rounded-2xl">
              <p className="text-gray-600 text-sm mb-3">
                Complete your matching profile to see top matches.
              </p>
              <Link
                to="/onboarding"
                className="inline-block px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl text-sm font-semibold"
              >
                Complete profile
              </Link>
            </div>
          ) : matchesLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-40 bg-gray-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : topMatches.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {topMatches.map((match) => (
                <MatchCard
                  key={match.userId}
                  user={match}
                  score={match.score}
                  variant="compact"
                  isMutualMatch={match.isMutualMatch}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              No matches yet. Check back soon!
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;
