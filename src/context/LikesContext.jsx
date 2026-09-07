import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getSentLikes } from "../services/api";
import { useAuth } from "./AuthContext";

const LikesContext = createContext(null);

export const LikesProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [likedUserIds, setLikedUserIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refreshLikes = useCallback(async () => {
    if (!user) {
      setLikedUserIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const response = await getSentLikes();
      setLikedUserIds(new Set(response.data));
    } catch (error) {
      console.error("Failed to load sent likes:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLikedUserIds(new Set());
      return;
    }

    refreshLikes();
  }, [user, authLoading, refreshLikes]);

  const isLiked = useCallback(
    (userId) => likedUserIds.has(userId),
    [likedUserIds],
  );

  const markLiked = useCallback((userId) => {
    setLikedUserIds((prev) => new Set(prev).add(userId));
  }, []);

  const markUnliked = useCallback((userId) => {
    setLikedUserIds((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  return (
    <LikesContext.Provider
      value={{
        likedUserIds,
        isLiked,
        markLiked,
        markUnliked,
        refreshLikes,
        loading,
      }}
    >
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error("useLikes must be used within LikesProvider");
  }
  return context;
};
