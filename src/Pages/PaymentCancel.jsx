import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, XCircle } from "lucide-react";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-28 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-10 text-center"
      >
        <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Checkout Cancelled
        </h1>
        <p className="text-gray-600 mb-2">
          Your payment was not completed{provider ? ` via ${provider}` : ""}.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          No charges were made. You can try again whenever you are ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Link>
          <Link
            to="/explore"
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition"
          >
            Continue Browsing
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
