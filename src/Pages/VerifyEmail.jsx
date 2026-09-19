import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader, Mail } from "lucide-react";
import api from "../services/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      setStatus("success");
      setMessage(response.data.message || "Email verified successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Verification failed. The link may be invalid or expired.",
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F4EF] px-4 py-28 text-[#2B171D]">
      <motion.div
        className="w-full max-w-md bg-[#FAF0F3] rounded-3xl shadow-xl p-8 md:p-10 border border-[#F6D1DA]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        {/* Status Icon */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {status === "verifying" && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7C1835] rounded-full mb-4 shadow-md">
              <Loader className="text-white animate-spin" size={40} />
            </div>
          )}

          {status === "success" && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7C1835] rounded-full mb-4 shadow-md">
              <CheckCircle className="text-white" size={40} />
            </div>
          )}

          {status === "error" && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#A31D36] rounded-full mb-4 shadow-md">
              <XCircle className="text-white" size={40} />
            </div>
          )}

          <h2
            className={`text-3xl font-extrabold mb-2 ${
              status === "success"
                ? "text-[#7C1835]"
                : status === "error"
                  ? "text-[#A31D36]"
                  : "text-[#7C1835]"
            }`}
          >
            {status === "verifying" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </h2>
        </motion.div>

        {/* Message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[#6B545A] text-base mb-6 font-medium">{message}</p>

          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-[#FAF0F3] border border-[#F6D1DA] rounded-xl p-4">
                <p className="text-[#7C1835] font-bold text-sm">
                  ✅ Your account is now active!
                </p>
                <p className="text-[#6B545A] text-sm mt-2 font-medium">
                  Redirecting to login page...
                </p>
              </div>

              <motion.button
                onClick={() => navigate("/login")}
                className="w-full py-3.5 btn-primary text-white font-bold rounded-xl shadow-lg cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Go to Login
              </motion.button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-[#A31D36]/10 border border-[#A31D36]/30 rounded-xl p-4">
                <p className="text-[#A31D36] font-bold text-sm">
                  ❌ Unable to verify your email
                </p>
                <p className="text-[#A31D36] text-sm mt-2 font-medium">
                  The verification link may have expired or is invalid.
                </p>
              </div>

              <motion.button
                onClick={() => navigate("/resend-verification")}
                className="w-full py-3.5 btn-primary text-white font-bold rounded-xl shadow-lg cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Request New Link
              </motion.button>

              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 text-[#7C1835] font-bold rounded-xl hover:bg-[#F6D1DA]/50 transition cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          )}

          {status === "verifying" && (
            <div className="bg-[#FAF0F3] border border-[#F6D1DA] rounded-xl p-4">
              <p className="text-[#7C1835] font-bold text-sm">
                Please wait while we verify your email address...
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
