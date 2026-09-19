import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, XCircle } from "lucide-react";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider");

  return (
    <div className="min-h-screen bg-[#F8F4EF] pt-28 pb-16 px-4 text-[#2B171D] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full mx-auto bg-[#FAF0F3] rounded-3xl shadow-xl border border-[#F6D1DA] p-10 text-center"
      >
        <XCircle className="w-16 h-16 text-[#7C1835] mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-[#7C1835] mb-3">
          Checkout Cancelled
        </h1>
        <p className="text-[#2B171D] font-semibold mb-2">
          Your payment was not completed{provider ? ` via ${provider}` : ""}.
        </p>
        <p className="text-[#6B545A] text-sm font-medium mb-8">
          No charges were made. You can try again whenever you are ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 btn-primary text-white rounded-xl font-bold shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Link>
          <Link
            to="/explore"
            className="px-6 py-3.5 btn-secondary rounded-xl font-bold shadow-sm cursor-pointer"
          >
            Continue Browsing
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
