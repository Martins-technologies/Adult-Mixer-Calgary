import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

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
    if (!id || isOwnProfile) return;

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
  }, [id, isOwnProfile]);

  const handleLikeToggle = async () => {
    if (!user || likeLoading) return;

    setLikeLoading(true);
    const wasLiked = user.isLikedByMe;

    try {
      if (wasLiked) {
        await api.delete("/likes", { data: { toUserId: user.id } });
        setUser((prev) => ({
          ...prev,
          isLikedByMe: false,
          isMatched: false,
          matchId: null,
        }));
        toast.success("Like removed");
      } else {
        const response = await api.post("/likes", { toUserId: user.id });
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

  if (loading) {
    return (
      <div className="min-h-screen pt-28 px-4 bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center text-xl"
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
    <div className="min-h-screen pt-24 px-4 bg-pink-50 pb-10">
      <motion.div
        className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6 text-center relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {user.isOnline !== undefined && (
          <motion.span
            className={`absolute top-4 right-4 px-3 py-1 text-xs rounded-full ${
              user.isOnline
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {user.isOnline ? "Online" : "Offline"}
          </motion.span>
        )}

        {user.hasLikedMe && !user.isMatched && (
          <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-xl text-sm text-pink-700 font-medium">
            {displayName} liked your profile! Like back to match.
          </div>
        )}

        <motion.img
          src={imageUrl}
          alt={displayName}
          className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-pink-200"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x400?text=Profile";
          }}
        />

        <motion.h1
          className="text-3xl font-bold mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-pink-600">Name:</span> {displayName}
          {age && (
            <>
              <br />
              <span className="text-pink-600">Age:</span> {age}
            </>
          )}
        </motion.h1>

        {user.city && (
          <p className="text-gray-500 text-sm mt-2">{user.city}</p>
        )}

        <motion.p
          className="text-pink-600 mt-4"
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
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 ${
              user.isLikedByMe
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Heart
              size={18}
              className={user.isLikedByMe ? "fill-red-500 text-red-500" : ""}
            />
            {likeLoading
              ? "Updating..."
              : user.isLikedByMe
                ? "Liked"
                : user.hasLikedMe
                  ? "Like Back"
                  : "Like Profile"}
          </motion.button>

          {user.isMatched ? (
            <motion.button
              onClick={() => navigate(`/chat/${user.id}`)}
              className="w-full py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle size={18} />
              Start Chat
            </motion.button>
          ) : (
            <p className="text-sm text-gray-500 px-2">
              {user.isLikedByMe
                ? "Waiting for them to like you back to unlock chat."
                : "Like this profile to connect. Chat unlocks when you both like each other."}
            </p>
          )}

          <motion.button
            onClick={() => navigate(-1)}
            className="w-full py-3 border rounded-xl text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
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
