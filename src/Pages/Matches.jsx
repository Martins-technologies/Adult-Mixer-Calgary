import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Heart, MessageCircle, Sparkles, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import api, { getReceivedLikes, getTopMatches } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLikes } from "../context/LikesContext";

const formatTopMutualMatch = (topMatch) => ({
  matchId: topMatch.userId,
  matchedAt: null,
  score: topMatch.score,
  user: {
    id: topMatch.userId,
    firstName: topMatch.name?.split(" ")[0] || topMatch.name || "",
    lastName: topMatch.name?.split(" ").slice(1).join(" ") || "",
    profileImageUrl: topMatch.photoUrl,
    bio: null,
    birthDate: topMatch.age
      ? new Date(new Date().getFullYear() - topMatch.age, 0, 1).toISOString()
      : null,
  },
});

const loadAllMutualMatches = async () => {
  const matchMap = new Map();

  try {
    const matchesRes = await api.get("/users/matches");
    if (Array.isArray(matchesRes.data)) {
      matchesRes.data.forEach((match) => {
        matchMap.set(match.user.id, match);
      });
    }
  } catch (err) {
    console.error("Failed to fetch mutual matches:", err);
  }

  try {
    const topRes = await getTopMatches(100);
    if (Array.isArray(topRes.data)) {
      topRes.data
        .filter((match) => match.isMutualMatch)
        .forEach((match) => {
          const existing = matchMap.get(match.userId);
          if (existing) {
            matchMap.set(match.userId, { ...existing, score: match.score });
          } else {
            matchMap.set(match.userId, formatTopMutualMatch(match));
          }
        });
    }
  } catch (err) {
    console.error("Failed to fetch top mutual matches:", err);
  }

  return Array.from(matchMap.values());
};

const Matches = () => {
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { markLiked } = useLikes();

  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && !user) {
        setLoading(false);
        return;
      }

      if (authLoading) {
        return;
      }

      const [matchesResult, likesResult] = await Promise.allSettled([
        loadAllMutualMatches(),
        getReceivedLikes(),
      ]);

      if (matchesResult.status === "fulfilled") {
        setMatches(matchesResult.value);
      } else {
        console.error("Failed to fetch matches:", matchesResult.reason);
        toast.error("Failed to load matches. Please try again.");
      }

      if (likesResult.status === "fulfilled") {
        setReceivedLikes(likesResult.value.data);
      } else {
        setReceivedLikes([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, authLoading]);

  const handleLikeBack = async (e, profileUser) => {
    e.stopPropagation();
    try {
      const response = await api.post("/likes", { toUserId: profileUser.id });
      if (response.data.matchCreated) {
        toast.success("It's a match! You can start chatting.");
        setReceivedLikes((prev) =>
          prev.filter((item) => item.user.id !== profileUser.id),
        );
        const refreshedMatches = await loadAllMutualMatches();
        setMatches(refreshedMatches);
      } else {
        markLiked(profileUser.id);
        setReceivedLikes((prev) =>
          prev.map((item) =>
            item.user.id === profileUser.id
              ? { ...item, isLikedBack: true }
              : item,
          ),
        );
        toast.success("Profile liked!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to like profile. Please try again.",
      );
    }
  };

  const filteredMatches = matches.filter((m) => {
    const fullName =
      `${m.user.firstName} ${m.user.lastName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const filteredLikes = receivedLikes.filter((item) => {
    const fullName =
      `${item.user.firstName} ${item.user.lastName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen pt-28 px-4 bg-[#F8F4EF] flex items-center justify-center">
        <p className="text-[#6B545A] font-semibold text-lg">Loading matches...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-28 px-4 bg-[#F8F4EF] flex items-center justify-center">
        <div className="text-center bg-[#FAF0F3] p-10 rounded-3xl border border-[#F6D1DA] shadow-xl max-w-md mx-auto">
          <Heart className="mx-auto mb-4 text-[#A31D36] fill-[#A31D36]" size={64} />
          <h2 className="text-2xl font-extrabold text-[#7C1835] mb-4">
            Please login to see your matches
          </h2>
          <p className="text-[#6B545A] mb-6 font-medium">
            You need to be logged in to view your matches and connections.
          </p>
          <motion.button
            onClick={() => navigate("/login")}
            className="px-8 py-3.5 btn-primary text-white rounded-xl font-bold shadow-md cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login Now
          </motion.button>
        </div>
      </div>
    );
  }

  const hasContent = matches.length > 0 || receivedLikes.length > 0;

  if (!hasContent) {
    return (
      <div className="min-h-screen pt-28 px-4 bg-[#F8F4EF] flex items-center justify-center">
        <div className="text-center bg-[#FAF0F3] p-10 rounded-3xl border border-[#F6D1DA] shadow-xl max-w-md mx-auto">
          <Heart className="mx-auto mb-4 text-[#A31D36] fill-[#A31D36]" size={64} />
          <h2 className="text-2xl font-extrabold text-[#7C1835] mb-4">
            You don&apos;t have any matches yet.
          </h2>
          <p className="text-[#6B545A] mb-6 font-medium">
            Start exploring and liking profiles to find your matches!
          </p>
          <motion.button
            onClick={() => navigate("/explore")}
            className="px-8 py-3.5 btn-primary text-white rounded-xl font-bold shadow-md cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Profiles
          </motion.button>
        </div>
      </div>
    );
  }

  const renderUserCard = (profileUser, actions, key, score) => {
    const imageUrl =
      profileUser.profileImageUrl || "https://via.placeholder.com/400";
    const fullName =
      `${profileUser.firstName} ${profileUser.lastName || ""}`.trim();
    const age = profileUser.birthDate
      ? new Date().getFullYear() -
        new Date(profileUser.birthDate).getFullYear()
      : null;

    return (
      <motion.div
        key={key}
        className="group relative bg-[#FAF0F3] rounded-3xl shadow-lg border border-[#F6D1DA] overflow-hidden cursor-pointer text-[#2B171D]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.02 }}
        onClick={() => navigate(`/profile/${profileUser.id}`)}
      >
        <div className="relative overflow-hidden h-64">
          <motion.img
            src={imageUrl}
            alt={fullName}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B171D]/70 via-transparent to-transparent" />
          <motion.div className="absolute top-4 left-4" whileHover={{ scale: 1.2, rotate: 15 }}>
            <Heart className="text-white fill-[#A31D36] drop-shadow-md" size={24} />
          </motion.div>
          {score != null && (
            <span className="absolute top-4 right-4 bg-[#7C1835] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              {score}% match
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-[#2B171D] mb-1">
              {fullName}
              {age ? `, ${age}` : ""}
            </h2>
            {profileUser.bio && (
              <p className="text-sm text-[#6B545A] font-medium line-clamp-2">{profileUser.bio}</p>
            )}
          </div>
          {actions}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-10 relative overflow-hidden bg-[#F8F4EF] text-[#2B171D]">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 mb-4"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="text-[#C88B7B]" size={32} />
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#7C1835]">
            Your Matches
          </h1>
          <Heart className="text-[#A31D36] fill-[#A31D36]" size={32} />
        </motion.div>
        <p className="text-[#6B545A] text-lg font-medium">
          Discover amazing connections waiting for you
        </p>
      </motion.div>

      <motion.div
        className="max-w-2xl mx-auto mb-12 relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative bg-[#FAF0F3] rounded-2xl shadow-md border border-[#F6D1DA] overflow-hidden">
          <Search
            className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#7C1835]"
            size={24}
          />
          <input
            className="w-full pl-14 pr-5 py-4 bg-transparent text-[#2B171D] placeholder-[#6B545A] focus:outline-none text-lg font-medium"
            placeholder="Search your perfect match..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {filteredLikes.length > 0 && (
        <section className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-[#2B171D] mb-2 flex items-center gap-2">
            <UserPlus className="text-[#7C1835]" size={24} />
            People Who Liked You
          </h2>
          <p className="text-[#6B545A] mb-6 font-medium">
            View their profile and like them back to create a match.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLikes.map((item) =>
              renderUserCard(
                item.user,
                <div className="flex gap-3">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${item.user.id}`);
                    }}
                    className="flex-1 py-3 btn-secondary rounded-xl font-bold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Profile
                  </motion.button>
                  {!item.isLikedBack && (
                    <motion.button
                      onClick={(e) => handleLikeBack(e, item.user)}
                      className="flex-1 py-3 btn-primary rounded-xl font-bold text-sm shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Like Back
                    </motion.button>
                  )}
                </div>,
                `like-${item.likeId}`,
              ),
            )}
          </div>
        </section>
      )}

      {filteredMatches.length > 0 && (
        <section className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#2B171D] mb-6 flex items-center gap-2">
            <Heart className="text-[#A31D36] fill-[#A31D36]" size={24} />
            Mutual Matches
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMatches.map((match) =>
              renderUserCard(
                match.user,
                <div className="flex gap-3">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/${match.user.id}`);
                    }}
                    className="flex-1 py-3 btn-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle size={18} />
                    Chat
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${match.user.id}`);
                    }}
                    className="px-5 py-3 btn-secondary rounded-xl font-bold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart size={18} className="fill-[#7C1835]" />
                  </motion.button>
                </div>,
                match.matchId,
                match.score,
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Matches;
