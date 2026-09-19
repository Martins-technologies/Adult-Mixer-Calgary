import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Loader2, XCircle } from "lucide-react";
import { confirmCheckoutSession, getPaymentSubscription } from "../services/payments";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const expectedPlan = searchParams.get("plan")?.toUpperCase();
  const [status, setStatus] = useState("confirming");
  const [subscription, setSubscription] = useState(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let intervalId;

    const isSubscriptionReady = (data) => {
      const tier = data?.tier;
      const isPaid = tier && tier !== "FREE";
      const matchesExpected = expectedPlan ? tier === expectedPlan : isPaid;
      return matchesExpected && data?.status === "ACTIVE";
    };

    const pollSubscription = async () => {
      try {
        const response = await getPaymentSubscription();
        if (cancelled) return;

        setSubscription(response.data);

        if (isSubscriptionReady(response.data)) {
          setStatus("confirmed");
          clearInterval(intervalId);
        } else if (attemptsRef.current >= 7) {
          setStatus("timeout");
          clearInterval(intervalId);
        }
      } catch {
        if (!cancelled && attemptsRef.current >= 7) {
          setStatus("timeout");
          clearInterval(intervalId);
        }
      }
    };

    const confirmPayment = async () => {
      if (sessionId) {
        try {
          const response = await confirmCheckoutSession(sessionId);
          if (cancelled) return;

          setSubscription(response.data);
          if (isSubscriptionReady(response.data)) {
            setStatus("confirmed");
            return;
          }
        } catch {
          // Fall back to polling if direct confirmation fails
        }
      }

      pollSubscription();
      intervalId = setInterval(() => {
        attemptsRef.current += 1;
        pollSubscription();
      }, 2000);
    };

    confirmPayment();

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [expectedPlan, sessionId]);

  return (
    <div className="min-h-screen bg-[#F8F4EF] pt-28 pb-16 px-4 text-[#2B171D] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full mx-auto bg-[#FAF0F3] rounded-3xl shadow-xl border border-[#F6D1DA] p-10 text-center"
      >
        {status === "confirming" && (
          <>
            <Loader2 className="w-16 h-16 text-[#7C1835] animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-extrabold text-[#7C1835] mb-3">
              Confirming your payment...
            </h1>
            <p className="text-[#6B545A] font-medium">
              Please wait while we verify your subscription with the payment
              provider. This usually takes a few seconds.
            </p>
          </>
        )}

        {status === "confirmed" && (
          <>
            <div className="w-20 h-20 bg-[#7C1835] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#7C1835] mb-3">
              Subscription Active!
            </h1>
            <p className="text-[#6B545A] mb-8 font-medium">
              Your{" "}
              <strong className="text-[#2B171D]">{subscription?.planDetails?.name ?? subscription?.plan}</strong>{" "}
              plan is now active. Enjoy your premium features!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/explore"
                className="px-6 py-3.5 btn-primary text-white rounded-xl font-bold shadow-md cursor-pointer"
              >
                Start Exploring
              </Link>
              <Link
                to="/profile"
                className="px-6 py-3.5 btn-secondary rounded-xl font-bold shadow-sm cursor-pointer"
              >
                Manage Subscription
              </Link>
            </div>
          </>
        )}

        {status === "timeout" && (
          <>
            <XCircle className="w-16 h-16 text-[#C88B7B] mx-auto mb-6" />
            <h1 className="text-2xl font-extrabold text-[#7C1835] mb-3">
              Still Processing
            </h1>
            <p className="text-[#6B545A] mb-8 font-medium">
              Your payment may still be processing. Check your profile in a few
              minutes, or contact support if your subscription does not appear.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/profile"
                className="px-6 py-3.5 btn-primary text-white rounded-xl font-bold shadow-md"
              >
                Check Profile
              </Link>
              <Link
                to="/pricing"
                className="px-6 py-3.5 btn-secondary rounded-xl font-bold"
              >
                Back to Pricing
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
