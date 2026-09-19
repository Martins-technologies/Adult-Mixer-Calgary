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
        className="text-xs text-[#7C1835] hover:text-[#5A0F24] font-semibold flex items-center gap-1 ml-1"
      >
        <HelpCircle size={14} />
        what&apos;s this?
      </button>
      {show && (
        <div className="absolute top-6 left-0 z-20 w-64 p-3 bg-[#2B171D] text-[#F8F4EF] text-xs rounded-xl shadow-xl border border-[#7C1835]">
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
        className="bg-[#FAF0F3] rounded-2xl shadow-md border border-[#F6D1DA] overflow-hidden cursor-pointer hover:-translate-y-1 transition min-w-[160px] flex-1 text-[#2B171D]"
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
          <span className="absolute top-2 right-2 bg-[#7C1835] text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            {score != null ? `${score}%` : "Match"}
          </span>
          {isMutualMatch && (
            <span className="absolute top-2 left-2 bg-[#A31D36] text-white text-xs font-bold px-2 py-1 rounded-full shadow">
              Matched
            </span>
          )}
        </div>
        <div className="p-3 text-center">
          <p className="font-bold text-sm truncate text-[#2B171D]">{user?.name}</p>
          {user?.age && (
            <p className="text-[#6B545A] text-xs font-medium">{user.age} yrs</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-[#FAF0F3] rounded-3xl shadow-lg border border-[#F6D1DA] overflow-hidden hover:-translate-y-1 transition text-[#2B171D]"
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
        <div className="absolute top-4 right-4 bg-[#F8F4EF]/95 backdrop-blur-sm rounded-full px-3.5 py-1.5 flex items-center gap-1 border border-[#F6D1DA] shadow">
          <span className="text-[#7C1835] font-extrabold text-sm">Score: {score}%</span>
          <ScoreTooltip />
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-extrabold text-[#2B171D]">
          {user?.name}
          {user?.age ? `, ${user.age}` : ""}
        </h2>
        {user?.city && (
          <p className="text-[#6B545A] text-sm mt-1 flex items-center gap-1 font-medium">
            <MapPin size={14} className="text-[#7C1835]" />
            {user.city}
            {distanceKm != null && ` · ${distanceKm} km away`}
          </p>
        )}

        {sharedAttributes.length > 0 && (
          <div className="mt-4 space-y-2 bg-[#F8F4EF] p-3 rounded-2xl border border-[#F6D1DA]">
            <p className="text-xs font-bold text-[#7C1835] uppercase tracking-wider">Shared attributes</p>
            {sharedAttributes.map((attr, i) => {
              const Icon = ICON_MAP[attr.icon] || Heart;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-[#2B171D]"
                >
                  <Icon size={16} className="text-[#A31D36] shrink-0" />
                  <span className="font-semibold text-[#2B171D]">{attr.label}:</span>
                  <span className="text-[#6B545A]">{attr.value}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex gap-4">
          {onSkip && (
            <motion.button
              onClick={() => onSkip(user?.userId)}
              className="flex-1 py-3 rounded-xl btn-secondary font-bold flex justify-center items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} /> Skip
            </motion.button>
          )}
          {onLike && (
            <motion.button
              onClick={() => onLike(user)}
              className={`flex-1 py-3 rounded-xl flex justify-center items-center gap-2 font-bold transition shadow-md ${
                isLiked
                  ? "bg-[#F6D1DA] text-[#7C1835]"
                  : "btn-primary"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart
                className={isLiked ? "fill-[#7C1835] text-[#7C1835]" : "fill-white text-white"}
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
