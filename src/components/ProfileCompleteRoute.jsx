import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ProfileCompleteRoute = ({ children }) => {
  const { user, loading, updateUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [profileComplete, setProfileComplete] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      if (user.profileComplete !== undefined) {
        setProfileComplete(user.profileComplete);
        setChecking(false);
        return;
      }

      try {
        const response = await api.get("/users/me/profile");
        const complete = response.data.profileComplete ?? false;
        updateUser({ ...response.data, profileComplete: complete });
        setProfileComplete(complete);
      } catch {
        setProfileComplete(false);
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, [user, updateUser]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProfileCompleteRoute;
