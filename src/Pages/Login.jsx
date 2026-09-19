import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Heart, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.from;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("All fields are required");
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error("Invalid server response");
      }

      login(user, token);

      let loggedInUser = user;
      try {
        const profileRes = await api.get("/users/me/profile");
        login(profileRes.data, token);
        loggedInUser = profileRes.data;
      } catch {
        // Keep basic login data if profile fetch fails
      }

      toast.success("Welcome back! Login successful.");

      if (redirectTo) {
        navigate(redirectTo);
      } else if (loggedInUser.profileComplete) {
        navigate("/explore");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.message || "Invalid email or password";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center py-28 px-4 text-[#2B171D]"
      style={{ backgroundImage: "url('/login_bg.jpg')" }}
    >
      {/* Ambient Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2B171D]/80 via-[#2B171D]/65 to-[#2B171D]/85 backdrop-blur-[3px] pointer-events-none"></div>

      <Toaster />

      {/* Main Glass Card */}
      <motion.div
        className="relative z-10 w-full max-w-lg bg-[#FAF0F3]/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-[#F6D1DA] transition-all"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#7C1835] to-[#A31D36] rounded-2xl mb-4 shadow-lg shadow-[#7C1835]/30 text-white">
            <Heart size={30} fill="white" />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-[#7C1835] mb-2 tracking-tight">
            Welcome Back
          </h2>

          <p className="text-[#6B545A] text-sm md:text-base font-medium">
            Log in to connect with Calgary verified adult singles & couples
          </p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-[#A31D36]/10 border border-[#A31D36]/30 text-[#A31D36] text-sm p-4 rounded-2xl mb-6 text-center font-semibold"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Email */}
          <div>
            <label className="block text-[#2B171D] font-bold mb-2 text-sm">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-3.5 text-[#7C1835]"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border border-[#F6D1DA] bg-white rounded-2xl focus:ring-2 focus:ring-[#7C1835] focus:border-transparent outline-none transition text-[#2B171D] font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[#2B171D] font-bold text-sm">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-4 top-3.5 text-[#7C1835]"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3.5 border border-[#F6D1DA] bg-white rounded-2xl focus:ring-2 focus:ring-[#7C1835] focus:border-transparent outline-none transition text-[#2B171D] font-medium shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-[#7C1835] hover:text-[#5A0F24] transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 btn-primary text-lg font-bold rounded-2xl shadow-xl transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Sign In</span>
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Security badge */}
        <div className="mt-6 pt-6 border-t border-[#F6D1DA]/60 flex items-center justify-center gap-2 text-xs text-[#6B545A] font-medium">
          <ShieldCheck size={16} className="text-[#7C1835]" />
          <span>256-Bit Encrypted & Discretion Protected</span>
        </div>

        {/* Footer */}
        <motion.div className="text-center mt-6">
          <p className="text-sm text-[#6B545A] font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#7C1835] font-extrabold hover:underline">
              Create an Account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
