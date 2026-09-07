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

      <p className="text-sm font-semibold text-pink-600 mb-3 uppercase tracking-wide">

        {label}

      </p>

      <div className="relative">

        <img

          src={imageUrl}

          alt={name}

          className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border-4 border-white shadow-xl"

          onError={(e) => {

            e.target.onerror = null;

            e.target.src = "https://via.placeholder.com/200x200?text=Profile";

          }}

        />

        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">

          {age ? `${age} yrs` : "Profile"}

        </span>

      </div>

      <h3 className="mt-5 text-xl md:text-2xl font-bold text-gray-800">{name}</h3>

      {city && (

        <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">

          <MapPin size={14} />

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

    <div className="min-h-screen pt-24 px-4 pb-12 relative overflow-hidden">

      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50" />



      <motion.div

        className="text-center mb-10"

        initial={{ opacity: 0, y: -20 }}

        animate={{ opacity: 1, y: 0 }}

      >

        <div className="inline-flex items-center gap-2 mb-3">

          <Sparkles className="text-pink-500" size={28} />

          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">

            Match Found!

          </h1>

          <Sparkles className="text-purple-500" size={28} />

        </div>

        <p className="text-gray-600 text-lg max-w-xl mx-auto">

          We found someone compatible with your profile. Here is your best match

          based on your preferences.

        </p>

      </motion.div>



      <motion.div

        className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-100 p-8 md:p-12"

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

            <div className="relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">

              <Heart className="text-white fill-white" size={36} />

            </div>

            <p className="mt-4 text-3xl md:text-4xl font-extrabold text-pink-600">

              {match.score}%

            </p>

            <p className="text-sm text-gray-500 font-medium">Compatibility</p>

            {match.distanceKm != null && (

              <p className="text-xs text-gray-400 mt-1">{match.distanceKm} km away</p>

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

          <div className="mt-10 pt-8 border-t border-pink-100">

            <h4 className="text-center font-semibold text-gray-700 mb-4">

              What you have in common

            </h4>

            <div className="flex flex-wrap justify-center gap-3">

              {match.sharedAttributes.map((attr, i) => {

                const Icon = ICON_MAP[attr.icon] || Heart;

                return (

                  <span

                    key={i}

                    className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium"

                  >

                    <Icon size={16} />

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

            className="px-8 py-3 rounded-xl border border-pink-300 text-pink-600 font-semibold hover:bg-pink-50 transition"

          >

            View Profile

          </button>

          <button

            onClick={handleLike}

            disabled={likeLoading || liked}

            className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50"

          >

            <Heart size={18} className={liked ? "fill-white" : ""} />

            {likeLoading ? "Liking..." : liked ? "Liked" : "Like Profile"}

          </button>

          <button

            onClick={() => navigate("/explore")}

            className="px-8 py-3 rounded-xl border border-purple-300 text-purple-600 font-semibold flex items-center justify-center gap-2 hover:bg-purple-50 transition"

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


