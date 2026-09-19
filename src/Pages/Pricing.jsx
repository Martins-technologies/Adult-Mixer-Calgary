import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Award, Heart, Crown, Zap, Shield, Star, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { PLAN_ROUTE_MAP } from "../constants/pricingPlans";
import { useAuth } from "../context/AuthContext";
import { createStripeCheckout } from "../services/payments";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSelectPlan = async (planName) => {
    if (!user) {
      navigate("/login", {
        state: { from: `/pricing` },
      });
      return;
    }

    const planId = PLAN_ROUTE_MAP[planName];
    const interval = billingCycle === "monthly" ? "MONTHLY" : "YEARLY";

    try {
      setLoadingPlan(planName);
      const response = await createStripeCheckout({
        plan: planId,
        billingCycle: interval,
      });

      const checkoutUrl = response.data?.url;
      if (!checkoutUrl) {
        toast.error("Stripe did not return a checkout URL");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to start checkout. Please try again.",
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  const pricingPlans = [
    {
      name: "Starter",
      icon: Heart,
      tagline: "Perfect for beginners",
      price: billingCycle === "monthly" ? "$2.99" : "$29.99",
      originalPrice: billingCycle === "monthly" ? "" : "$35.88",
      period: billingCycle === "monthly" ? "per month" : "per year",
      gradient: "from-[#7C1835] to-[#A31D36]",
      bgGradient: "from-[#FAF0F3] to-[#F8F4EF]",
      buttonClass: "btn-secondary font-bold shadow-md",
      iconBg: "bg-[#7C1835]",
      features: [
        { text: "Browse unlimited profiles", included: true },
        { text: "5 likes per day", included: true },
        { text: "Basic matching algorithm", included: true },
        { text: "Send messages", included: false },
        { text: "Video chat access", included: false },
        { text: "See who liked you", included: false },
        { text: "Priority support", included: false },
        { text: "Advanced filters", included: false },
      ],
    },
    {
      name: "Premium",
      icon: Award,
      tagline: "Most popular choice",
      price: billingCycle === "monthly" ? "$5.99" : "$59.99",
      originalPrice: billingCycle === "monthly" ? "" : "$71.88",
      period: billingCycle === "monthly" ? "per month" : "per year",
      gradient: "from-[#7C1835] via-[#A31D36] to-[#C88B7B]",
      bgGradient: "from-[#FAF0F3] via-[#F8F4EF] to-[#F6D1DA]/30",
      buttonClass: "btn-premium shadow-lg text-lg",
      iconBg: "bg-[#C88B7B]",
      popular: true,
      features: [
        { text: "Everything in Starter", included: true },
        { text: "Unlimited likes", included: true },
        { text: "Send unlimited messages", included: true },
        { text: "Video chat access", included: true },
        { text: "See who liked you", included: true },
        { text: "Advanced matching AI", included: true },
        { text: "Priority support", included: false },
        { text: "Profile boost (2x/month)", included: false },
      ],
    },
    {
      name: "Elite",
      icon: Crown,
      tagline: "Ultimate experience",
      price: billingCycle === "monthly" ? "$9.99" : "$99.99",
      originalPrice: billingCycle === "monthly" ? "" : "$119.88",
      period: billingCycle === "monthly" ? "per month" : "per year",
      gradient: "from-[#2B171D] via-[#7C1835] to-[#A31D36]",
      bgGradient: "from-[#FAF0F3] to-[#F8F4EF]",
      buttonClass: "btn-primary font-bold shadow-md",
      iconBg: "bg-[#2B171D]",
      features: [
        { text: "Everything in Premium", included: true },
        { text: "Priority profile placement", included: true },
        { text: "Advanced filters & search", included: true },
        { text: "Read receipts", included: true },
        { text: "Incognito mode", included: true },
        { text: "Profile boost (unlimited)", included: true },
        { text: "24/7 VIP support", included: true },
        { text: "Exclusive events access", included: true },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F4EF] pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24 px-4 sm:px-6 md:px-8 lg:px-12 relative overflow-hidden text-[#2B171D]">
      <Toaster />
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[#F6D1DA] to-[#C88B7B] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[#7C1835] to-[#FAF0F3] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16 px-2"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-[#7C1835] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-md border border-[#F6D1DA]/40"
          >
            <Star className="w-4 h-4 fill-current text-[#C88B7B]" />
            <span>Special Launch Offer - Save up to 20%</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6 text-[#2B171D]">
            <span className="gradient-text-wine">
              Find Your Perfect Match
            </span>
          </h1>
          <p className="text-[#6B545A] max-w-3xl mx-auto px-2 leading-relaxed text-lg font-medium">
            Choose the membership plan that fits your journey. All plans come with our satisfaction guarantee.
          </p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <span className={`text-sm font-bold transition-colors ${billingCycle === "monthly" ? "text-[#2B171D]" : "text-[#6B545A]"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-16 h-8 bg-[#7C1835] rounded-full shadow-md transition-all hover:shadow-lg"
            >
              <motion.div
                animate={{ x: billingCycle === "monthly" ? 2 : 34 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-[#F6D1DA] rounded-full shadow-md"
              />
            </button>
            <span className={`text-sm font-bold transition-colors ${billingCycle === "yearly" ? "text-[#2B171D]" : "text-[#6B545A]"}`}>
              Yearly
            </span>
            {billingCycle === "yearly" && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-[#F6D1DA] text-[#7C1835] px-3 py-1 rounded-full text-xs font-bold"
              >
                Save 20%
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 lg:gap-8 max-w-md md:max-w-none mx-auto"
        >
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.03, 
                  y: -6,
                  transition: { duration: 0.3 }
                }}
                className={`relative ${plan.popular ? "md:scale-105 lg:scale-105" : ""}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-4 -right-2 z-20"
                  >
                    <div className="bg-[#C88B7B] text-[#2B171D] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-extrabold border border-[#2B171D]/20">
                      <Star className="w-4 h-4 fill-current text-[#2B171D]" />
                      MOST POPULAR
                    </div>
                  </motion.div>
                )}

                <div className={`relative bg-[#FAF0F3] rounded-3xl shadow-xl h-full flex flex-col p-8 border-2 border-[#F6D1DA] overflow-hidden ${plan.popular ? "ring-2 ring-[#C88B7B]" : ""}`}>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                    className={`w-14 h-14 ${plan.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-md relative z-10`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </motion.div>

                  {/* Plan Name & Tagline */}
                  <div className="mb-6 relative z-10">
                    <h3 className="text-2xl font-extrabold text-[#2B171D] mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-[#6B545A] font-medium">{plan.tagline}</p>
                  </div>

                  {/* Price Section */}
                  <div className="mb-6 relative z-10">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl md:text-5xl font-extrabold text-[#7C1835]`}>
                        {plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-base text-[#6B545A] line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-[#6B545A] mt-1 text-sm font-medium">{plan.period}</p>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#F6D1DA] mb-6" />

                  {/* Features List */}
                  <div className="flex-grow mb-6 relative z-10">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            feature.included 
                              ? "bg-[#F6D1DA] text-[#7C1835]" 
                              : "bg-[#F8F4EF] text-gray-300"
                          }`}>
                            {feature.included ? (
                              <Check className="w-3.5 h-3.5 text-[#7C1835] stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              feature.included 
                                ? "text-[#2B171D] font-semibold" 
                                : "text-[#6B545A]/60 line-through"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={() => handleSelectPlan(plan.name)}
                    disabled={loadingPlan === plan.name}
                    whileHover={{ scale: loadingPlan === plan.name ? 1 : 1.02 }}
                    whileTap={{ scale: loadingPlan === plan.name ? 1 : 0.98 }}
                    className={`w-full py-3.5 rounded-xl ${plan.buttonClass} transition-all duration-300 shadow-md relative z-10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loadingPlan === plan.name ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Get Started Now
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 md:mt-20"
        >
          <div className="bg-[#FAF0F3] rounded-3xl shadow-xl border border-[#F6D1DA] p-8 md:p-12 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-[#7C1835] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#2B171D] mb-2">100% Secure</h4>
                <p className="text-[#6B545A] text-sm font-medium">Your data is encrypted and protected</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-[#A31D36] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
                <h4 className="text-xl font-bold text-[#2B171D] mb-2">50K+ Matches</h4>
                <p className="text-[#6B545A] text-sm font-medium">Made every month on our platform</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-[#C88B7B] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Star className="w-8 h-8 text-[#2B171D] fill-[#2B171D]" />
                </div>
                <h4 className="text-xl font-bold text-[#2B171D] mb-2">4.9/5 Rating</h4>
                <p className="text-[#6B545A] text-sm font-medium">From 10,000+ happy users</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          id="faqs"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 md:mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#7C1835] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#6B545A] text-lg font-medium">
              Everything you need to know about our membership plans
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: "Can I upgrade or downgrade my plan anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll get immediate access to new features. If you downgrade, changes will take effect at the end of your current billing cycle."
              },
              {
                question: "Are all profiles on AdultMixer Calgary verified?",
                answer: "Absolutely! We manually review every profile to ensure authenticity and safety. Our verification process includes photo verification and profile screening to maintain a trusted community of genuine users in Calgary."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards via Stripe Checkout. All payments are processed securely with industry-standard encryption — card details never touch our servers."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time with no cancellation fees. You'll continue to have access to premium features until the end of your current billing period. Plus, we offer a 30-day money-back guarantee if you're not satisfied."
              },
              {
                question: "How does the matching algorithm work?",
                answer: "Our smart AI-powered matching algorithm analyzes your preferences, interests, location, and activity to suggest the most compatible matches in Calgary. Premium and Elite members get access to advanced matching features for even better results."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="bg-[#FAF0F3] rounded-2xl shadow-md border border-[#F6D1DA] overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-[#F8F4EF] transition-all duration-300">
                    <h3 className="text-lg font-bold text-[#2B171D] pr-4">
                      {faq.question}
                    </h3>
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7C1835] flex items-center justify-center text-white font-bold group-open:rotate-45 transition-transform duration-300 shadow-sm"
                    >
                      +
                    </motion.div>
                  </summary>
                  <div className="px-6 pb-6 text-[#6B545A] leading-relaxed border-t border-[#F6D1DA] pt-4 font-medium text-base">
                    {faq.answer}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 btn-primary text-white rounded-xl font-bold shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-white" />
                Contact Support
              </motion.button>
            </Link>
            <a href="#faqs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 btn-secondary rounded-xl font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                View All FAQs
              </motion.button>
            </a>
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-[#FAF0F3] border-2 border-[#F6D1DA] px-6 py-4 rounded-2xl shadow-sm">
            <Shield className="w-6 h-6 text-[#7C1835]" />
            <span className="text-[#2B171D] font-bold">
              30-Day Money Back Guarantee - No Questions Asked
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
