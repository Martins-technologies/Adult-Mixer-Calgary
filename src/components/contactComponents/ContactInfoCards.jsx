import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactInfoCards = () => {
  return (
    <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 -mt-12 mb-20 relative z-20">
      <InfoCard
        icon={<Mail size={36} className="text-[#7C1835]" />}
        title="Email Us"
        text="support@adultmixercalgary.com"
        delay={0.1}
      />
      <InfoCard
        icon={<Phone size={36} className="text-[#7C1835]" />}
        title="Call Us"
        text="+1 (587) 123-4567"
        delay={0.3}
      />
      <InfoCard
        icon={<MapPin size={36} className="text-[#7C1835]" />}
        title="Location"
        text="Calgary, Alberta, Canada"
        delay={0.5}
      />
    </section>
  );
};

const InfoCard = ({ icon, title, text, delay = 0 }) => {
  return (
    <motion.div 
      className="bg-[#FAF0F3] p-8 rounded-2xl shadow-lg border border-[#F6D1DA] text-center cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.03, y: -4 }}
    >
      <div className="text-[#7C1835] mx-auto mb-4 flex justify-center bg-[#F8F4EF] p-3 w-16 h-16 rounded-2xl border border-[#F6D1DA] items-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#2B171D]">{title}</h3>
      <p className="text-[#6B545A] mt-2 font-medium text-sm">{text}</p>
    </motion.div>
  );
};

export default ContactInfoCards;
