import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLikes } from "../context/LikesContext";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { isLiked, markLiked, markUnliked, likedUserIds } = useLikes();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);

  const isOwnProfile = !id || (currentUser && id === currentUser.id);

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      navigate("/profile", { replace: true });
    }
  }, [isOwnProfile, currentUser, navigate]);

  useEffect(() => {
    if (!id || isOwnProfile || authLoading) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, isOwnProfile, authLoading]);

  useEffect(() => {
    if (!id) return;

    setUser((prev) =>
      prev
        ? { ...prev, isLikedByMe: prev.isLikedByMe || likedUserIds.has(id) }
        : prev,
    );
  }, [likedUserIds, id]);

  const handleLikeToggle = async () => {
    if (!user || likeLoading) return;

    setLikeLoading(true);
    const wasLiked = user.isLikedByMe || isLiked(user.id);

    try {
      if (wasLiked) {
        await api.delete("/likes", { data: { toUserId: user.id } });
        markUnliked(user.id);
        setUser((prev) => ({
          ...prev,
          isLikedByMe: false,
          isMatched: false,
          matchId: null,
        }));
        toast.success("Like removed");
      } else {
        const response = await api.post("/likes", { toUserId: user.id });
        markLiked(user.id);
        const matchCreated = response.data.matchCreated;
        setUser((prev) => ({
          ...prev,
          isLikedByMe: true,
          isMatched: matchCreated || prev.isMatched,
          matchId: response.data.match?.id ?? prev.matchId,
        }));

        if (matchCreated) {
          toast.success("It's a match! You can start chatting now.");
        } else {
          toast.success("Profile liked! They'll see you liked them.");
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update like. Please try again.",
      );
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen pt-28 px-4 bg-[#F8F4EF] flex items-center justify-center">
        <p className="text-[#6B545A] font-semibold text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center text-xl text-[#7C1835] font-bold bg-[#F8F4EF]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Profile not found
      </motion.div>
    );
  }

  const displayName = `${user.firstName} ${user.lastName || ""}`.trim();
  const age = user.birthDate
    ? new Date().getFullYear() - new Date(user.birthDate).getFullYear()
    : null;
  const imageUrl =
    user.profileImageUrl && user.profileImageUrl.trim() !== ""
      ? user.profileImageUrl
      : "https://via.placeholder.com/400x400?text=Profile";

  return (
    <div className="min-h-screen pt-24 px-4 bg-[#F8F4EF] pb-10 text-[#2B171D]">
      <motion.div
        className="max-w-md mx-auto bg-[#FAF0F3] rounded-3xl shadow-xl p-8 text-center relative border border-[#F6D1DA]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {user.isOnline !== undefined && (
          <motion.span
            className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full border ${
              user.isOnline
                ? "bg-[#FAF0F3] text-[#7C1835] border-[#F6D1DA]"
                : "bg-[#F8F4EF] text-[#6B545A] border-[#F6D1DA]"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {user.isOnline ? "Online" : "Offline"}
          </motion.span>
        )}

        {user.hasLikedMe && !user.isMatched && (
          <div className="mb-4 p-3 bg-[#FAF0F3] border border-[#F6D1DA] rounded-xl text-sm text-[#7C1835] font-bold">
            {displayName} liked your profile! Like back to match.
          </div>
        )}

        <motion.img
          src={imageUrl}
          alt={displayName}
          className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-[#C88B7B] shadow-md"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x400?text=Profile";
          }}
        />

        <motion.h1
          className="text-3xl font-extrabold mt-4 text-[#2B171D]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {displayName}
          {age ? `, ${age}` : ""}
        </motion.h1>

        {user.city && (
          <p className="text-[#6B545A] text-sm mt-2 font-medium">{user.city}</p>
        )}

        <motion.p
          className="text-[#6B545A] mt-4 font-medium text-base leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {user.bio || "No bio available"}
        </motion.p>

        <motion.div
          className="mt-6 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={handleLikeToggle}
            disabled={likeLoading}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md ${
              user.isLikedByMe || isLiked(user.id)
                ? "bg-[#F6D1DA] text-[#7C1835]"
                : "btn-primary text-white"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Heart
              size={18}
              className={
                user.isLikedByMe || isLiked(user.id)
                  ? "fill-[#7C1835] text-[#7C1835]"
                  : "fill-white text-white"
              }
            />
            {likeLoading
              ? "Updating..."
              : user.isLikedByMe || isLiked(user.id)
                ? "Liked"
                : user.hasLikedMe
                  ? "Like Back"
                  : "Like Profile"}
          </motion.button>

          {user.isMatched ? (
            <motion.button
              onClick={() => navigate(`/chat/${user.id}`)}
              className="w-full py-3.5 btn-primary text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle size={18} />
              Start Chat
            </motion.button>
          ) : (
            <p className="text-sm text-[#6B545A] px-2 font-medium">
              {user.isLikedByMe || isLiked(user.id)
                ? "Waiting for them to like you back to unlock chat."
                : "Like this profile to connect. Chat unlocks when you both like each other."}
            </p>
          )}

          <motion.button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 btn-secondary rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
