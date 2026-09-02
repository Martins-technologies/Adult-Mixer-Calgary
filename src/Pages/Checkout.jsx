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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24">
        <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-28 pb-16 px-4">
      <Toaster />
      <div className="max-w-2xl mx-auto">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Complete Your Subscription</h1>
            </div>
            <p className="text-pink-100">
              Welcome, {user?.firstName}! You will pay securely via Stripe
              Checkout.
            </p>
          </div>

          <div className="p-8">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {plan?.name} Plan
                  </h2>
                  <p className="text-gray-600 text-sm">{plan?.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-pink-600">
                    ${price?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {billingCycle === "MONTHLY" ? "per month" : "per year"}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {plan?.features?.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Payment Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {plan?.name} (
                    {billingCycle === "MONTHLY" ? "Monthly" : "Yearly"})
                  </span>
                  <span className="font-medium">${price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                  <span>Total due today</span>
                  <span>${price?.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Powered by Stripe · Card details never touch our servers
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure checkout · 30-day money-back guarantee</span>
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-pink-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Pay with Stripe
                </>
              )}
            </motion.button>

            <p className="text-xs text-gray-400 text-center mt-4">
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
