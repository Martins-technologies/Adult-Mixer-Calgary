import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Crown,
  Heart,
  Loader2,
  Shield,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { createStripeCheckout } from "../services/payments";
import { BILLING_CYCLES } from "../constants/pricingPlans";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const planId = searchParams.get("plan")?.toUpperCase();
  const billingCycle =
    searchParams.get("billing") === BILLING_CYCLES.YEARLY
      ? "YEARLY"
      : "MONTHLY";

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get("/subscriptions/plans");
        const selectedPlan = response.data.find((item) => item.id === planId);

        if (!selectedPlan) {
          toast.error("Invalid plan selected");
          navigate("/pricing");
          return;
        }

        setPlan(selectedPlan);
      } catch {
        toast.error("Failed to load plan details");
        navigate("/pricing");
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    } else {
      navigate("/pricing");
    }
  }, [planId, navigate]);

  const price =
    billingCycle === "MONTHLY" ? plan?.monthlyPrice : plan?.yearlyPrice;

  const handleCheckout = async () => {
    try {
      setSubmitting(true);

      const response = await createStripeCheckout({
        plan: planId,
        billingCycle,
      });

      const checkoutUrl = response.data?.url;
      if (!checkoutUrl) {
        toast.error("Stripe did not return a checkout URL");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to start Stripe checkout. Check your Stripe configuration.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F4EF] pt-24">
        <Loader2 className="w-10 h-10 text-[#7C1835] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EF] pt-28 pb-16 px-4 text-[#2B171D]">
      <Toaster />
      <div className="max-w-2xl mx-auto">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-[#7C1835] hover:text-[#5A0F24] font-bold mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FAF0F3] rounded-3xl shadow-xl border border-[#F6D1DA] overflow-hidden"
        >
          <div className="gradient-brand p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-[#C88B7B]" />
              <h1 className="text-2xl font-extrabold text-white">Complete Your Subscription</h1>
            </div>
            <p className="text-[#F8F4EF]/90 font-medium text-sm">
              Welcome, {user?.firstName}! You will pay securely via Stripe
              Checkout.
            </p>
          </div>

          <div className="p-8">
            <div className="bg-[#F8F4EF] rounded-2xl border border-[#F6D1DA] p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2B171D]">
                    {plan?.name} Plan
                  </h2>
                  <p className="text-[#6B545A] text-sm font-medium">{plan?.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-[#7C1835]">
                    ${price?.toFixed(2)}
                  </p>
                  <p className="text-sm text-[#6B545A] font-medium">
                    {billingCycle === "MONTHLY" ? "per month" : "per year"}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {plan?.features?.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-[#2B171D] font-medium"
                  >
                    <Check className="w-4 h-4 text-[#7C1835] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#F6D1DA] rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-[#7C1835]" />
                <h3 className="font-extrabold text-[#2B171D]">Payment Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#2B171D]">
                  <span className="text-[#6B545A] font-medium">
                    {plan?.name} (
                    {billingCycle === "MONTHLY" ? "Monthly" : "Yearly"})
                  </span>
                  <span className="font-bold">${price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[#F6D1DA] pt-2 font-extrabold text-[#2B171D]">
                  <span>Total due today</span>
                  <span className="text-[#7C1835]">${price?.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-[#6B545A] mt-3 font-medium">
                Powered by Stripe · Card details never touch our servers
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#6B545A] mb-6 font-semibold">
              <Shield className="w-4 h-4 text-[#7C1835]" />
              <span>Secure checkout · 30-day money-back guarantee</span>
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full py-4 btn-primary text-white text-lg font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" />
                  Pay with Stripe
                </>
              )}
            </motion.button>

            <p className="text-xs text-[#6B545A] text-center mt-4 font-medium">
              By subscribing, you agree to our Terms of Service. Your
              subscription is confirmed only after Stripe verifies payment via
              webhook.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
