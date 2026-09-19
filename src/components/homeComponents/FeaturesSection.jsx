import React from "react";
import { motion } from "framer-motion";

const FeaturesSection = () => {
  return (
    <>
      {/* Features Section */}
      <section className="py-16 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 bg-[#F8F4EF]">
        <motion.div 
          className="bg-[#FAF0F3] p-8 rounded-2xl shadow-sm border border-[#F6D1DA] text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -4 }}
        >
          <h3 className="text-xl font-bold text-[#7C1835] mb-2">
            Easy Matching
          </h3>
          <p className="text-[#6B545A]">
            Smart AI-based matching helps you find profiles that fit your exact
            preferences.
          </p>
        </motion.div>
        <motion.div 
          className="bg-[#FAF0F3] p-8 rounded-2xl shadow-sm border border-[#F6D1DA] text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -4 }}
        >
          <h3 className="text-xl font-bold text-[#7C1835] mb-2">
            Verified Profiles
          </h3>
          <p className="text-[#6B545A]">
            Every user profile is checked for privacy, authenticity & safety.
          </p>
        </motion.div>
        <motion.div 
          className="bg-[#FAF0F3] p-8 rounded-2xl shadow-sm border border-[#F6D1DA] text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.03, y: -4 }}
        >
          <h3 className="text-xl font-bold text-[#7C1835] mb-2">Instant Chat</h3>
          <p className="text-[#6B545A]">
            Chat instantly with matches using our fast, private & secure messaging
            system.
          </p>
        </motion.div>
      </section>
    </>
  );
};

export default FeaturesSection;
