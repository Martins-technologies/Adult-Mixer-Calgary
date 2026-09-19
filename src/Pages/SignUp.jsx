import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Mail, Calendar, Lock, Heart, ChevronDown, Check, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
  });

  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const genderDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
        setGenderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (password) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      validatePassword(value);
    }
  };

  const isPasswordValid = () => {
    return (
      passwordStrength.hasMinLength &&
      passwordStrength.hasUpperCase &&
      passwordStrength.hasLowerCase &&
      passwordStrength.hasNumber &&
      passwordStrength.hasSpecialChar
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.age ||
      !formData.gender
    ) {
      setError("All fields are required");
      toast.error("Please fill in all fields");
      return;
    }

    if (parseInt(formData.age, 10) < 18) {
      setError("You must be at least 18 years old");
      toast.error("Age must be 18 or older");
      return;
    }

    if (!isPasswordValid()) {
      setError("Please satisfy all password requirements");
      toast.error("Password does not meet security requirements");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await api.post("/auth/register", {
        firstName: formData.name,
        lastName: "",
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age, 10),
        gender: formData.gender,
      });

      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error("Registration failed");
      }

      login(user, token);

      toast.success("Account created successfully!");
      navigate("/onboarding");
    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err.response?.data?.message ||
        "Registration failed. Email may already be in use.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center py-28 px-4 text-[#2B171D]"
      style={{ backgroundImage: "url('/signup_bg.jpg')" }}
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
            Create Your Account
          </h2>

          <p className="text-[#6B545A] text-sm md:text-base font-medium">
            Join Calgary's premier adult mixer community in seconds
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
          className="space-y-4 md:space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Full Name */}
          <div>
            <label className="block text-[#2B171D] font-bold mb-2 text-sm">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-3.5 text-[#7C1835]"
                size={20}
              />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border border-[#F6D1DA] bg-white rounded-2xl focus:ring-2 focus:ring-[#7C1835] focus:border-transparent outline-none transition text-[#2B171D] font-medium shadow-sm"
              />
            </div>
          </div>

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

          {/* Age & Gender Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#2B171D] font-bold mb-2 text-sm">
                Age (18+)
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-3.5 text-[#7C1835]"
                  size={20}
                />
                <input
                  type="number"
                  name="age"
                  placeholder="25"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="99"
                  className="w-full pl-12 pr-4 py-3.5 border border-[#F6D1DA] bg-white rounded-2xl focus:ring-2 focus:ring-[#7C1835] focus:border-transparent outline-none transition text-[#2B171D] font-medium shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#2B171D] font-bold mb-2 text-sm">
                Gender
              </label>
              <div className="relative" ref={genderDropdownRef}>
                <User
                  className="absolute left-4 top-3.5 text-[#7C1835] pointer-events-none z-10"
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                  className={`w-full pl-12 pr-8 py-3.5 border rounded-2xl text-left flex items-center justify-between transition-all bg-white font-medium shadow-sm ${
                    genderDropdownOpen
                      ? "border-[#7C1835] ring-2 ring-[#7C1835]/20 shadow-md"
                      : "border-[#F6D1DA] hover:border-[#7C1835]/50"
                  } ${formData.gender ? "text-[#2B171D]" : "text-[#8A7178]"}`}
                >
                  <span className="truncate whitespace-nowrap">
                    {formData.gender === "MALE"
                      ? "Male"
                      : formData.gender === "FEMALE"
                      ? "Female"
                      : "Select gender"}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-[#7C1835] shrink-0 transition-transform duration-200 ${
                      genderDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {genderDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 left-0 right-0 mt-1.5 bg-[#FAF0F3] border border-[#F6D1DA] rounded-2xl shadow-2xl overflow-hidden py-1.5"
                    >
                      {[
                        { value: "", label: "Select gender" },
                        { value: "MALE", label: "Male" },
                        { value: "FEMALE", label: "Female" },
                      ].map((opt) => {
                        const isSelected = formData.gender === opt.value;
                        return (
                          <div
                            key={opt.value}
                            onClick={() => {
                              handleChange({ target: { name: "gender", value: opt.value } });
                              setGenderDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition flex items-center justify-between ${
                              isSelected
                                ? "bg-[#7C1835] text-white font-bold"
                                : "text-[#2B171D] hover:bg-[#7C1835] hover:text-white"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check size={16} className="text-white shrink-0 ml-2" />}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#2B171D] font-bold mb-2 text-sm">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-3.5 text-[#7C1835]"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
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

            {/* Password Requirements */}
            {formData.password && (
              <motion.div
                className="mt-3 p-3.5 bg-white/80 rounded-2xl space-y-1.5 border border-[#F6D1DA]"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs font-bold text-[#2B171D] mb-1.5">
                  Security Check:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={passwordStrength.hasMinLength ? "text-[#7C1835] font-bold" : "text-gray-400"}>
                      {passwordStrength.hasMinLength ? "✓" : "○"}
                    </span>
                    <span className={passwordStrength.hasMinLength ? "text-[#7C1835] font-semibold" : "text-[#6B545A]"}>
                      8+ Characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={passwordStrength.hasUpperCase ? "text-[#7C1835] font-bold" : "text-gray-400"}>
                      {passwordStrength.hasUpperCase ? "✓" : "○"}
                    </span>
                    <span className={passwordStrength.hasUpperCase ? "text-[#7C1835] font-semibold" : "text-[#6B545A]"}>
                      Uppercase (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={passwordStrength.hasLowerCase ? "text-[#7C1835] font-bold" : "text-gray-400"}>
                      {passwordStrength.hasLowerCase ? "✓" : "○"}
                    </span>
                    <span className={passwordStrength.hasLowerCase ? "text-[#7C1835] font-semibold" : "text-[#6B545A]"}>
                      Lowercase (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={passwordStrength.hasNumber ? "text-[#7C1835] font-bold" : "text-gray-400"}>
                      {passwordStrength.hasNumber ? "✓" : "○"}
                    </span>
                    <span className={passwordStrength.hasNumber ? "text-[#7C1835] font-semibold" : "text-[#6B545A]"}>
                      Number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
                    <span className={passwordStrength.hasSpecialChar ? "text-[#7C1835] font-bold" : "text-gray-400"}>
                      {passwordStrength.hasSpecialChar ? "✓" : "○"}
                    </span>
                    <span className={passwordStrength.hasSpecialChar ? "text-[#7C1835] font-semibold" : "text-[#6B545A]"}>
                      Special Symbol (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 btn-primary text-lg font-bold rounded-2xl shadow-xl transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? "Creating Account..." : "Join AdultMixer Calgary"}
          </motion.button>
        </motion.form>

        {/* Security badge */}
        <div className="mt-6 pt-6 border-t border-[#F6D1DA]/60 flex items-center justify-center gap-2 text-xs text-[#6B545A] font-medium">
          <ShieldCheck size={16} className="text-[#7C1835]" />
          <span>Strict Discretion & Verified Authentic Profiles</span>
        </div>

        {/* Footer */}
        <motion.div className="text-center mt-6">
          <p className="text-sm text-[#6B545A] font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-[#7C1835] font-extrabold hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
