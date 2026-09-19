import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/auth/resend-verification", { email });

      setSuccess(true);
      toast.success(response.data.message || "Verification email sent!");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to send verification email. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F4EF] px-4 py-28 text-[#2B171D]">
      <Toaster />

      <motion.div
        className="w-full max-w-md bg-[#FAF0F3] rounded-3xl shadow-xl p-8 md:p-10 border border-[#F6D1DA]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C1835] rounded-full mb-4 shadow-md">
            <Mail className="text-white" size={32} />
          </div>

          <h2 className="text-3xl font-extrabold text-[#7C1835] mb-2">
            Resend Verification
          </h2>

          <p className="text-[#6B545A] text-sm font-medium">
            Enter your email to receive a new verification link
          </p>
        </motion.div>

        {success ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-[#FAF0F3] border border-[#F6D1DA] rounded-xl p-6 text-center">
              <div className="text-[#7C1835] text-5xl mb-4">✉️</div>
              <h3 className="text-[#7C1835] font-extrabold text-lg mb-2">
                Email Sent!
              </h3>
              <p className="text-[#6B545A] text-sm font-medium">
                We've sent a new verification link to{" "}
                <span className="font-bold text-[#2B171D]">{email}</span>
              </p>
              <p className="text-[#6B545A] text-sm mt-2 font-medium">
                Please check your inbox and click the verification link.
              </p>
            </div>

            <Link to="/login">
              <motion.button
                className="w-full py-3.5 btn-primary text-white font-bold rounded-xl shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Login
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
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
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#F6D1DA] bg-white rounded-xl focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D] font-medium"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 btn-primary text-white text-lg font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? "Sending..." : "Send Verification Email"}
            </motion.button>

            <Link to="/login">
              <button
                type="button"
                className="w-full py-3 text-[#7C1835] font-bold rounded-xl hover:bg-[#F6D1DA]/50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={20} />
                Back to Login
              </button>
            </Link>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default ResendVerification;
