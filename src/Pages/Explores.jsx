import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { discoverUsers, skipUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLikes } from "../context/LikesContext";

const PAGE_SIZE = 20;

const Explore = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLiked, markLiked, markUnliked, likedUserIds } = useLikes();

  const [isAdult, setIsAdult] = useState(null);
  const [filter, setFilter] = useState("everyone");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchProfiles = useCallback(
    async (pageNum, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const response = await discoverUsers({
          page: pageNum,
          limit: PAGE_SIZE,
        });

        const data = response.data;
        setHasMore(data.length === PAGE_SIZE);

        if (append) {
          setProfiles((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newItems = data.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newItems];
          });
        } else {
          setProfiles(data);
        }
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        toast.error("Failed to load profiles. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!user || likedUserIds.size === 0) return;

    setProfiles((prev) =>
      prev.map((profile) => ({
        ...profile,
        isLikedByMe: profile.isLikedByMe || likedUserIds.has(profile.id),
      })),
    );
  }, [likedUserIds, user]);

  useEffect(() => {
    if (authLoading) return;
    setPage(1);
    fetchProfiles(1);
  }, [authLoading, user?.id, fetchProfiles]);

  useEffect(() => {
    const verified = localStorage.getItem("adultVerified");
    setIsAdult(verified === "true" ? true : false);
  }, []);

  useEffect(() => {
    if (!loaderRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProfiles(nextPage, true);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchProfiles]);

  const handleAgeYes = () => {
    localStorage.setItem("adultVerified", "true");
    setIsAdult(true);
  };

  const handleAgeNo = () => navigate("/");

  const filteredProfiles =
    filter === "everyone"
      ? profiles
      : filter === "man"
        ? profiles.filter((p) => p.gender && p.gender.toUpperCase() === "MALE")
        : filter === "woman"
          ? profiles.filter(
              (p) => p.gender && p.gender.toUpperCase() === "FEMALE",
            )
          : profiles;

  const handleSkip = async (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    try {
      await skipUser(id);
    } catch (err) {
      console.error("Skip failed:", err);
    }
  };

  const updateProfileLikeState = (profileId, updates) => {
    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === profileId ? { ...profile, ...updates } : profile,
      ),
    );
  };

  const handleLikeToggle = async (profile) => {
    if (!user) {
      toast.error("Please login to like profiles");
      navigate("/login");
      return;
    }

    const profileId = profile.id;
    const wasLiked = profile.isLikedByMe || isLiked(profileId);
    const previousCount = profile.likeCount ?? 0;

    updateProfileLikeState(profileId, {
      isLikedByMe: !wasLiked,
      likeCount: wasLiked
        ? Math.max(0, previousCount - 1)
        : previousCount + 1,
    });

    if (wasLiked) {
      markUnliked(profileId);
    } else {
      markLiked(profileId);
    }

    try {
      if (wasLiked) {
        const response = await api.delete("/likes", {
          data: { toUserId: profileId },
        });
        updateProfileLikeState(profileId, {
          isLikedByMe: false,
          likeCount: response.data.likeCount,
        });
      } else {
        const response = await api.post("/likes", { toUserId: profileId });
        updateProfileLikeState(profileId, {
          isLikedByMe: true,
          likeCount: response.data.likeCount,
        });

        if (response.data.matchCreated) {
          toast.success("It's a match! Check your Matches page.");
        }
      }
    } catch (error) {
      updateProfileLikeState(profileId, {
        isLikedByMe: wasLiked,
        likeCount: previousCount,
      });

      if (wasLiked) {
        markLiked(profileId);
      } else {
        markUnliked(profileId);
      }

      if (error.response?.status === 401) {
        toast.error("Please login to like profiles");
        navigate("/login");
      } else {
        toast.error("Failed to update like. Please try again.");
      }
    }
  };

  if (isAdult === false) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-pink-600">18+ Age Verification</h2>
          <p className="text-gray-600 mt-4">
            This website contains adult content. You must be at least 18 years old
            to continue.
          </p>
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleAgeNo}
              className="flex-1 py-3 rounded-xl border hover:bg-gray-100"
            >
              No
            </button>
            <button
              onClick={handleAgeYes}
              className="flex-1 py-3 rounded-xl bg-pink-600 text-white hover:bg-pink-700"
            >
              Yes, I&apos;m 18+
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-10 relative overflow-hidden">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600 text-lg">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="text-pink-500 fill-pink-500" size={32} />
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Explore Matches
          </h1>
          <Heart className="text-pink-500 fill-pink-500" size={32} />
        </div>
        <p className="text-gray-600 text-lg">
          Discover real adults nearby. Filter by preference and connect with
          confidence.
        </p>
      </motion.div>

      <motion.div
        className="flex justify-center gap-4 mb-12 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {["everyone", "man", "woman"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-6 py-3 rounded-full font-semibold transition ${
              filter === type
                ? "bg-pink-600 text-white"
                : "bg-white border hover:bg-gray-100"
            }`}
          >
            {type === "everyone" && "Everyone"}
            {type === "man" && "Men"}
            {type === "woman" && "Women"}
          </button>
        ))}
      </motion.div>

      {filteredProfiles.length > 0 ? (
        <>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {filteredProfiles.map((profile, index) => {
                const age = profile.birthDate
                  ? new Date().getFullYear() -
                    new Date(profile.birthDate).getFullYear()
                  : null;
                const displayName =
                  `${profile.firstName} ${profile.lastName || ""}`.trim();
                const imageUrl =
                  profile.profileImageUrl && profile.profileImageUrl.trim() !== ""
                    ? profile.profileImageUrl
                    : "https://via.placeholder.com/400x400?text=Profile";
                const isLikedProfile = profile.isLikedByMe || isLiked(profile.id);
                const likeCount = profile.likeCount ?? 0;

                return (
                  <motion.div
                    key={profile.id}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden hover:-translate-y-1 transition"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <img
                      src={imageUrl}
                      alt={displayName}
                      loading="lazy"
                      className="w-full h-72 object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${profile.id}`)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/400x400?text=Profile";
                      }}
                    />
                    <div className="p-6">
                      <h2 className="text-2xl font-bold">
                        {displayName}
                        {age ? `, ${age}` : ""}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {profile.bio || "No bio available"}
                      </p>
                      <p className="text-sm text-pink-600 mt-3 font-semibold flex items-center gap-1">
                        <Heart
                          size={16}
                          className={
                            likeCount > 0
                              ? "fill-pink-500 text-pink-500"
                              : "text-pink-400"
                          }
                        />
                        {likeCount} {likeCount === 1 ? "like" : "likes"}
                      </p>
                      <div className="mt-6 flex gap-4">
                        <motion.button
                          onClick={() => handleSkip(profile.id)}
                          className="flex-1 py-3 rounded-xl border flex justify-center items-center gap-2 hover:bg-gray-100"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X /> Skip
                        </motion.button>
                        <motion.button
                          onClick={() => handleLikeToggle(profile)}
                          className={`flex-1 py-3 rounded-xl flex justify-center items-center gap-2 font-semibold transition ${
                            isLikedProfile
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart
                            className={
                              isLikedProfile ? "fill-red-500 text-red-500" : ""
                            }
                            size={18}
                          />
                          {isLikedProfile ? "Liked" : "Like"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
          {hasMore && (
            <div ref={loaderRef} className="text-center py-8 text-gray-500">
              {loadingMore ? "Loading more..." : ""}
            </div>
          )}
        </>
      ) : (
        <motion.div
          className="text-center mt-20 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Users size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold">No profiles available</h2>
          <p>Try changing filters or come back later.</p>
        </motion.div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Explore;

