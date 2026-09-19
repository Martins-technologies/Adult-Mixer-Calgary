import React from "react";
import { motion } from "framer-motion";

const ContactHeader = () => {
  return (
    <section className="gradient-brand text-white pt-32 pb-24 relative overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto px-6 text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Contact AdultMixer Calgary
        </motion.h1>
        <motion.p 
          className="mt-6 text-lg text-[#F8F4EF]/90 max-w-2xl mx-auto font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          We're here to help. Whether you have questions, feedback, or safety
          concerns, our support team is available 24/7.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default ContactHeader;
