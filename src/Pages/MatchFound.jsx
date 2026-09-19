import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";

import { Heart, MapPin, Sparkles, ArrowRight } from "lucide-react";

import { useNavigate, useLocation, Navigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { useLikes } from "../context/LikesContext";

import api from "../services/api";

import {

  Church,

  GraduationCap,

  User,

  Utensils,

  Wine,

  Cigarette,

  Pill,

  PawPrint,

  Languages,

} from "lucide-react";



const ICON_MAP = {

  church: Church,

  "graduation-cap": GraduationCap,

  user: User,

  utensils: Utensils,

  wine: Wine,

  cigarette: Cigarette,

  pill: Pill,

  "paw-print": PawPrint,

  languages: Languages,

};



const ProfileBubble = ({ name, age, photoUrl, city, label }) => {
  const imageUrl =
    photoUrl && photoUrl.trim() !== ""
      ? photoUrl
      : "https://via.placeholder.com/400x400?text=Profile";

  return (
    <motion.div
      className="flex flex-col items-center text-center flex-1 max-w-xs"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm font-bold text-[#7C1835] mb-3 uppercase tracking-wide">
        {label}
      </p>
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border-4 border-[#C88B7B] shadow-xl"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/200x200?text=Profile";
          }}
        />
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#7C1835] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow">
          {age ? `${age} yrs` : "Profile"}
        </span>
      </div>
      <h3 className="mt-5 text-xl md:text-2xl font-extrabold text-[#2B171D]">{name}</h3>
      {city && (
        <p className="text-[#6B545A] text-sm mt-1 flex items-center justify-center gap-1 font-medium">
          <MapPin size={14} className="text-[#7C1835]" />
          {city}
        </p>
      )}
    </motion.div>
  );
};



const MatchFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isLiked, markLiked } = useLikes();

  const match = location.state?.match;

  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (match?.userId) {
      setLiked(isLiked(match.userId));
    }
  }, [match?.userId, isLiked]);



  const handleLike = async () => {
    if (!match?.userId || likeLoading || liked) return;
    setLikeLoading(true);
    try {
      const response = await api.post("/likes", { toUserId: match.userId });
      setLiked(true);
      markLiked(match.userId);

      if (response.data.matchCreated) {
        toast.success("It's a match! You can start chatting now.");
      } else {
        toast.success("Profile liked! They'll see you liked them.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to like profile. Please try again.",
      );
    } finally {
      setLikeLoading(false);
    }
  };



  if (!user) {
    return <Navigate to="/login" replace />;
  }



  if (!match) {
    return <Navigate to="/explore" replace />;
  }



  const myName = `${user.firstName || ""}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
  const myAge = user.birthDate
    ? new Date().getFullYear() - new Date(user.birthDate).getFullYear()
    : null;



  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative overflow-hidden bg-[#F8F4EF] text-[#2B171D]">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="text-[#C88B7B]" size={28} />
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#7C1835]">
            Match Found!
          </h1>
          <Heart className="text-[#A31D36] fill-[#A31D36]" size={28} />
        </div>
        <p className="text-[#6B545A] text-lg max-w-xl mx-auto font-medium">
          We found someone compatible with your profile. Here is your best match
          based on your preferences.
        </p>
      </motion.div>



      <motion.div
        className="max-w-4xl mx-auto bg-[#FAF0F3] rounded-3xl shadow-xl border border-[#F6D1DA] p-8 md:p-12 text-[#2B171D]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
          <ProfileBubble
            label="You"
            name={myName || "You"}
            age={myAge}
            photoUrl={user.profileImageUrl}
            city={user.city}
          />



          <motion.div
            className="flex flex-col items-center justify-center px-4 py-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#7C1835] shadow-lg">
              <Heart className="text-white fill-white" size={36} />
            </div>
            <p className="mt-4 text-3xl md:text-4xl font-extrabold text-[#7C1835]">
              {match.score}%
            </p>
            <p className="text-sm text-[#6B545A] font-semibold">Compatibility</p>
            {match.distanceKm != null && (
              <p className="text-xs text-[#6B545A] mt-1">{match.distanceKm} km away</p>
            )}
          </motion.div>



          <ProfileBubble
            label="Your Match"
            name={match.name}
            age={match.age}
            photoUrl={match.photoUrl}
            city={match.city}
          />
        </div>



        {match.sharedAttributes?.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[#F6D1DA]">
            <h4 className="text-center font-bold text-[#7C1835] mb-4 text-lg">
              What you have in common
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              {match.sharedAttributes.map((attr, i) => {
                const Icon = ICON_MAP[attr.icon] || Heart;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8F4EF] text-[#7C1835] border border-[#F6D1DA] rounded-full text-sm font-semibold"
                  >
                    <Icon size={16} className="text-[#A31D36]" />
                    {attr.label}: {attr.value}
                  </span>
                );
              })}
            </div>
          </div>
        )}



        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(`/profile/${match.userId}`)}
            className="px-8 py-3.5 btn-secondary font-bold rounded-xl shadow-sm cursor-pointer"
          >
            View Profile
          </button>
          <button
            onClick={handleLike}
            disabled={likeLoading || liked}
            className="px-8 py-3.5 btn-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <Heart size={18} className={liked ? "fill-white" : ""} />
            {likeLoading ? "Liking..." : liked ? "Liked" : "Like Profile"}
          </button>
          <button
            onClick={() => navigate("/explore")}
            className="px-8 py-3.5 btn-secondary font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            Explore More Profiles
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchFound;
