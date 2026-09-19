import React from 'react';
import { motion } from 'framer-motion';

const GoogleMap = () => {
  return (
    <motion.section 
      className="max-w-6xl mx-auto mb-24 px-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2 
        className="text-3xl font-extrabold text-[#7C1835] text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Find Us in Calgary
      </motion.h2>
      <motion.div 
        className="rounded-3xl overflow-hidden shadow-xl border border-[#F6D1DA] h-96"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        whileHover={{ scale: 1.02 }}
      >
        <iframe
          src="https://maps.google.com/maps?q=calgary&t=&z=13&ie=UTF8&iwloc=&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="AdultMixer Calgary Location"
        ></iframe>
      </motion.div>
    </motion.section>
  );
};

export default GoogleMap;
