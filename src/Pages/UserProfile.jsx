import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Mail, FileText, Image, Save, Heart, Pencil, Crown, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import api, { getTopMatches, getPaymentSubscription, cancelPaymentSubscription } from "../services/api";
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
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
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

  const loadSubscription = useCallback(async () => {
    setSubscriptionLoading(true);
    try {
      const response = await getPaymentSubscription();
      setSubscription(response.data);
    } catch (err) {
      console.error("Failed to load subscription:", err);
    } finally {
      setSubscriptionLoading(false);
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
    loadSubscription();

    return () => {
      cancelled = true;
    };
  }, [user?.id, navigate, refreshUser, loadTopMatches, loadSubscription]);

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      setCancelling(true);
      const response = await cancelPaymentSubscription();
      toast.success(response.data.message || "Subscription cancelled");
      await loadSubscription();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel subscription",
      );
    } finally {
      setCancelling(false);
    }
  };

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F4EF] px-4 py-28 text-[#2B171D]">
      <Toaster />

      <motion.div
        className="w-full max-w-2xl bg-[#FAF0F3] rounded-3xl shadow-xl p-8 md:p-10 border border-[#F6D1DA]"
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C1835] rounded-full mb-4 shadow-md">
            <User className="text-white" size={30} />
          </div>
          <h2 className="text-4xl font-extrabold text-[#7C1835] mb-2">
            My Profile
          </h2>
          <p className="text-[#6B545A] text-sm font-medium">
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
              className="w-32 h-32 rounded-full object-cover border-4 border-[#C88B7B] shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#7C1835] flex items-center justify-center border-4 border-[#C88B7B] shadow-md">
              <User size={48} className="text-white" />
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
              <label className="block text-[#2B171D] font-bold mb-2 text-sm">
                First Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-3.5 text-[#7C1835]"
                  size={20}
                />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-[#F6D1DA] bg-white rounded-xl focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#2B171D] font-bold mb-2 text-sm">
                Last Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-3.5 text-[#7C1835]"
                  size={20}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-[#F6D1DA] bg-white rounded-xl focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#2B171D] font-bold mb-2 text-sm">
              Email (Read-only)
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-3.5 text-[#6B545A]"
                size={20}
              />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-12 pr-4 py-3 border border-[#F6D1DA] bg-[#F8F4EF] text-[#6B545A] rounded-xl cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2B171D] font-bold mb-2 text-sm">
              Bio
            </label>
            <div className="relative">
              <FileText
                className="absolute left-4 top-3.5 text-[#7C1835]"
                size={20}
              />
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full pl-12 pr-4 py-3 border border-[#F6D1DA] bg-white rounded-xl focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D] transition resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2B171D] font-bold mb-2 text-sm">
              Profile Image URL
            </label>
            <div className="relative">
              <Image
                className="absolute left-4 top-3.5 text-[#7C1835]"
                size={20}
              />
              <input
                type="url"
                name="profileImageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.profileImageUrl}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-[#F6D1DA] bg-white rounded-xl focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D]"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 btn-primary text-lg font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            <Save size={20} />
            <span>{isLoading ? "Saving..." : "Save Changes"}</span>
          </motion.button>

          {user.profileComplete && (
            <Link
              to="/onboarding?edit=true"
              className="w-full py-4 btn-secondary text-lg font-bold rounded-xl flex items-center justify-center space-x-2 shadow-sm"
            >
              <Pencil size={20} />
              <span>Edit Matching Profile</span>
            </Link>
          )}
        </motion.form>

        {/* Subscription Management */}
        <div className="mt-10 pt-8 border-t border-[#F6D1DA]">
          <h3 className="text-xl font-bold text-[#2B171D] flex items-center gap-2 mb-4">
            <Crown className="text-[#C88B7B]" size={22} />
            Subscription
          </h3>

          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#7C1835] animate-spin" />
            </div>
          ) : subscription?.tier && subscription.tier !== "FREE" ? (
            <div className="bg-[#F8F4EF] rounded-2xl p-6 border border-[#F6D1DA]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-[#2B171D]">
                    {subscription.planDetails?.name ?? subscription.plan} Plan
                  </p>
                  <p className="text-sm text-[#6B545A] capitalize font-medium">
                    Status: {subscription.status?.toLowerCase()}
                    {subscription.paymentProvider &&
                      ` · via ${subscription.paymentProvider.toLowerCase()}`}
                  </p>
                  {subscription.endDate && (
                    <p className="text-sm text-[#6B545A] mt-1 font-medium">
                      {subscription.status === "CANCELLED"
                        ? "Access until"
                        : "Renews"}{" "}
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {subscription.status === "ACTIVE" && !subscription.cancelledAt && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="px-5 py-2.5 border border-[#A31D36] text-[#A31D36] rounded-xl font-bold hover:bg-[#A31D36]/10 transition disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                )}
                {subscription.cancelledAt && subscription.status === "ACTIVE" && (
                  <p className="text-sm text-amber-700 font-medium">
                    Cancellation scheduled — access until{" "}
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString()
                      : "period end"}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-[#F8F4EF] rounded-2xl border border-[#F6D1DA]">
              <p className="text-[#6B545A] text-sm mb-4 font-medium">
                You are on the free plan. Upgrade to unlock premium features.
              </p>
              <Link
                to="/pricing"
                className="inline-block px-7 py-3 btn-premium rounded-xl text-sm font-bold shadow-md"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>

        {/* Top Matches Widget */}
        <div className="mt-10 pt-8 border-t border-[#F6D1DA]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2B171D] flex items-center gap-2">
              <Heart className="text-[#7C1835]" size={22} />
              Your Top Matches
            </h3>
            {user.profileComplete && (
              <Link
                to="/matches"
                className="text-sm text-[#7C1835] font-bold hover:text-[#5A0F24]"
              >
                See all
              </Link>
            )}
          </div>

          {!profileComplete ? (
            <div className="text-center py-6 bg-[#F8F4EF] border border-[#F6D1DA] rounded-2xl">
              <p className="text-[#6B545A] text-sm mb-3 font-medium">
                Complete your matching profile to see top matches.
              </p>
              <Link
                to="/onboarding"
                className="inline-block px-6 py-2.5 btn-primary text-white rounded-xl text-sm font-bold shadow-md"
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
