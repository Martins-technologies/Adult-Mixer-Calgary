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
        className="fixed inset-0 bg-[#2B171D]/80 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div className="bg-[#FAF0F3] border border-[#F6D1DA] rounded-3xl p-10 max-w-md text-center shadow-2xl text-[#2B171D]">
          <h2 className="text-3xl font-extrabold text-[#7C1835]">18+ Age Verification</h2>
          <p className="text-[#6B545A] mt-4 font-medium">
            This website contains adult content. You must be at least 18 years old
            to continue.
          </p>
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleAgeNo}
              className="flex-1 py-3 rounded-xl btn-secondary font-bold"
            >
              No
            </button>
            <button
              onClick={handleAgeYes}
              className="flex-1 py-3 rounded-xl btn-primary font-bold"
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
      <div className="min-h-screen pt-24 px-4 pb-10 relative overflow-hidden bg-[#F8F4EF]">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[#6B545A] text-lg font-semibold">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-10 relative overflow-hidden bg-[#F8F4EF] text-[#2B171D]">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="text-[#A31D36] fill-[#A31D36]" size={32} />
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#7C1835]">
            Explore Matches
          </h1>
          <Heart className="text-[#A31D36] fill-[#A31D36]" size={32} />
        </div>
        <p className="text-[#6B545A] text-lg font-medium">
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
            className={`px-6 py-3 rounded-full font-bold transition shadow-sm ${
              filter === type
                ? "btn-primary"
                : "bg-[#FAF0F3] text-[#2B171D] border border-[#F6D1DA] hover:bg-[#F6D1DA]"
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
                    className="bg-[#FAF0F3] rounded-3xl shadow-lg border border-[#F6D1DA] overflow-hidden hover:-translate-y-1 transition text-[#2B171D]"
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
                      <h2 className="text-2xl font-extrabold text-[#2B171D]">
                        {displayName}
                        {age ? `, ${age}` : ""}
                      </h2>
                      <p className="text-[#6B545A] mt-2 text-sm font-medium line-clamp-2">
                        {profile.bio || "No bio available"}
                      </p>
                      <p className="text-sm text-[#7C1835] mt-3 font-bold flex items-center gap-1">
                        <Heart
                          size={16}
                          className={
                            likeCount > 0
                              ? "fill-[#A31D36] text-[#A31D36]"
                              : "text-[#7C1835]"
                          }
                        />
                        {likeCount} {likeCount === 1 ? "like" : "likes"}
                      </p>
                      <div className="mt-6 flex gap-4">
                        <motion.button
                          onClick={() => handleSkip(profile.id)}
                          className="flex-1 py-3 rounded-xl btn-secondary font-bold flex justify-center items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X size={18} /> Skip
                        </motion.button>
                        <motion.button
                          onClick={() => handleLikeToggle(profile)}
                          className={`flex-1 py-3 rounded-xl flex justify-center items-center gap-2 font-bold transition shadow-md ${
                            isLikedProfile
                              ? "bg-[#F6D1DA] text-[#7C1835]"
                              : "btn-primary"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart
                            className={
                              isLikedProfile ? "fill-[#7C1835] text-[#7C1835]" : "fill-white text-white"
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
            <div ref={loaderRef} className="text-center py-8 text-[#6B545A] font-semibold">
              {loadingMore ? "Loading more..." : ""}
            </div>
          )}
        </>
      ) : (
        <motion.div
          className="text-center mt-20 text-[#6B545A]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Users size={48} className="mx-auto mb-4 text-[#7C1835]" />
          <h2 className="text-2xl font-bold text-[#2B171D]">No profiles available</h2>
          <p className="mt-1 font-medium">Try changing filters or come back later.</p>
        </motion.div>
      )}
    </div>
  );
};

export default Explore;

