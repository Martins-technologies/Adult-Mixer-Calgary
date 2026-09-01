import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  X,
  HelpCircle,
  Church,
  GraduationCap,
  User,
  Utensils,
  Wine,
  Cigarette,
  Pill,
  PawPrint,
  Languages,
  MapPin,
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

const ScoreTooltip = () => {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 ml-1"
      >
        <HelpCircle size={14} />
        what&apos;s this?
      </button>
      {show && (
        <div className="absolute top-6 left-0 z-20 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg">
          Compatibility is calculated from religion (20%), ethnicity (10%),
          education (10%), lifestyle habits (25%), language (10%), and distance
          from you (25%). Closer matches in Calgary score higher.
        </div>
      )}
    </span>
  );
};

const MatchCard = ({
  user,
  score,
  sharedAttributes = [],
  distanceKm,
  variant = "full",
  onSkip,
  onLike,
  isLiked,
  isMutualMatch = false,
}) => {
  const navigate = useNavigate();

  const photoUrl =
    user?.photoUrl && user.photoUrl.trim() !== ""
      ? user.photoUrl
      : "https://via.placeholder.com/400x400?text=Profile";

  const handleCardClick = () => {
    if (variant === "compact" && user?.userId) {
      navigate(`/profile/${user.userId}`);
    }
  };

  if (variant === "compact") {
    return (
      <motion.div
        onClick={handleCardClick}
        className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 transition min-w-[160px] flex-1"
        whileHover={{ scale: 1.03 }}
      >
        <div className="relative">
          <img
            src={photoUrl}
            alt={user?.name}
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/200x200?text=Profile";
            }}
          />
          <span className="absolute top-2 right-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {score != null ? `${score}%` : "Match"}
          </span>
          {isMutualMatch && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Matched
            </span>
          )}
        </div>
        <div className="p-3 text-center">
          <p className="font-bold text-sm truncate">{user?.name}</p>
          {user?.age && (
            <p className="text-gray-500 text-xs">{user.age} yrs</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-lg overflow-hidden hover:-translate-y-1 transition"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="relative">
        <img
          src={photoUrl}
          alt={user?.name}
          loading="lazy"
          className="w-full h-72 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/400x400?text=Profile";
          }}
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <span className="text-pink-600 font-bold text-sm">Score: {score}%</span>
          <ScoreTooltip />
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold">
          {user?.name}
          {user?.age ? `, ${user.age}` : ""}
        </h2>
        {user?.city && (
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
            <MapPin size={14} />
            {user.city}
            {distanceKm != null && ` · ${distanceKm} km away`}
          </p>
        )}

        {sharedAttributes.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Shared attributes</p>
            {sharedAttributes.map((attr, i) => {
              const Icon = ICON_MAP[attr.icon] || Heart;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Icon size={16} className="text-pink-500 shrink-0" />
                  <span className="font-medium text-gray-700">{attr.label}:</span>
                  <span>{attr.value}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex gap-4">
          {onSkip && (
            <motion.button
              onClick={() => onSkip(user?.userId)}
              className="flex-1 py-3 rounded-xl border flex justify-center items-center gap-2 hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X /> Skip
            </motion.button>
          )}
          {onLike && (
            <motion.button
              onClick={() => onLike(user)}
              className={`flex-1 py-3 rounded-xl flex justify-center items-center gap-2 font-semibold transition ${
                isLiked
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart
                className={isLiked ? "fill-red-500 text-red-500" : ""}
                size={18}
              />
              {isLiked ? "Liked" : "Like"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
