import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CallToAction = () => {
  const navigate = useNavigate();
  const handleclick = () => {
navigate("/contact")
  }
  return (
    <>
      {/* Call to Action */}
      <section className="py-20 gradient-brand text-center px-6 text-white my-10 rounded-3xl max-w-7xl mx-auto shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-[#F8F4EF]/90 max-w-xl mx-auto mb-8 text-lg">
            Join Adultmixer Calgary today & explore amazing connections waiting
            for you.
          </p>
          <motion.button 
            onClick={handleclick} 
            className="px-9 py-3.5 btn-secondary rounded-xl text-lg font-bold shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Now
          </motion.button>
        </motion.div>
      </section>
    </>
  );
};

export default CallToAction;
