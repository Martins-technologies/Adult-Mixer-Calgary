import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  MessageCircle,
  Users,
  MapPin,
  Lock,
} from "lucide-react";

const HeroSection = () => {
  return (
    <div className="w-full bg-[#F8F4EF]">

      {/* ================= HERO SECTION ================= */}
      <section className="relative gradient-brand text-white pt-36 md:pt-44 lg:pt-48 pb-24 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 md:gap-10 items-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:pr-8 space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-block bg-[#FAF0F3]/20 border border-[#F6D1DA]/40 text-[#F6D1DA] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide backdrop-blur-sm shadow-sm"
            >
              ✨ Exclusive Adult Dating in Calgary
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.15] text-white drop-shadow-md tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            >
              <span className="block">Find Real Connections</span>
              <span className="block">
                in{" "}
                <motion.span 
                  className="text-[#F6D1DA] inline-block"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Calgary
                </motion.span>
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-[#F8F4EF]/95 max-w-xl leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              AdultMixer Calgary is an exclusive, mature dating platform designed for adults
              seeking genuine connections, sophisticated conversations, and memorable experiences.
            </motion.p>

            <motion.div 
              className="pt-2 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className="inline-block px-8 py-4 rounded-xl font-extrabold btn-secondary shadow-xl text-base"
                >
                  Get Started
                </Link>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/explore"
                  className="inline-block px-8 py-4 rounded-xl font-extrabold bg-[#7C1835] text-white hover:bg-[#5A0F24] transition shadow-xl text-base border border-[#F6D1DA]/30"
                >
                  Explore Matches
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex justify-center items-center mt-12 md:mt-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full max-w-7xl h-[320px] sm:h-[380px] md:h-[420px] flex items-center justify-center px-4 sm:px-0">
              
              {/* Minimal Animated Particle Background */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full opacity-30"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      backgroundColor: i % 2 === 0 ? '#F6D1DA' : '#C88B7B',
                    }}
                    animate={{
                      y: [0, -60, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      opacity: [0.2, 0.5, 0.2],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 8 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                    }}
                  />
                ))}
              </div>

              {/* Main Interactive Dating Wheel */}
              <div className="relative z-10">
                
                {/* Central Love Meter - Responsive */}
                <motion.div
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <div className="bg-[#2B171D] rounded-full p-4 sm:p-5 md:p-6 shadow-2xl border-3 border-[#C88B7B]">
                    <motion.div
                      className="text-white text-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <motion.div 
                        className="text-xl sm:text-2xl md:text-3xl mb-1"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        💖
                      </motion.div>
                      <div className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-wide text-[#F6D1DA]">MATCH RATE</div>
                      <motion.div
                        className="text-sm sm:text-lg md:text-xl font-bold mt-1 text-[#C88B7B]"
                        animate={{ 
                          scale: [1, 1.08, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        98%
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Rotating Dating Profiles Wheel */}
                <motion.div
                  className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                  {[
                    { emoji: "👩‍💼", name: "Sarah", age: "28", bg: "bg-[#7C1835]" },
                    { emoji: "👨‍💻", name: "Mike", age: "32", bg: "bg-[#2B171D]" },
                    { emoji: "👩‍🎨", name: "Emma", age: "26", bg: "bg-[#A31D36]" },
                    { emoji: "👨‍🍳", name: "Alex", age: "30", bg: "bg-[#7C1835]" },
                    { emoji: "👩‍⚕️", name: "Lisa", age: "29", bg: "bg-[#C88B7B]" },
                    { emoji: "👨‍🎓", name: "David", age: "27", bg: "bg-[#2B171D]" },
                  ].map((profile, index) => {
                    const angle = (index * 60) * (Math.PI / 180);
                    const radius = window.innerWidth < 640 ? 110 : window.innerWidth < 768 ? 125 : 140;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <motion.div
                        key={index}
                        className={`absolute ${profile.bg} rounded-xl sm:rounded-2xl p-2 sm:p-2.5 md:p-3 shadow-xl border-2 border-[#F6D1DA] cursor-pointer`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: 'translate(-50%, -50%)',
                          width: "55px",
                          height: "70px",
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1 + index * 0.15, type: "spring" }}
                        whileHover={{ scale: 1.18, zIndex: 50 }}
                      >
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                          className="text-center text-white"
                        >
                          <div className="text-lg sm:text-xl md:text-2xl mb-0.5">{profile.emoji}</div>
                          <div className="text-[9px] sm:text-[10px] md:text-xs font-bold drop-shadow-sm">{profile.name}</div>
                          <div className="text-[8px] sm:text-[9px] md:text-xs text-[#F6D1DA]">{profile.age}</div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Live Action Notifications */}
              <motion.div
                className="absolute top-2 sm:top-3 md:top-5 right-2 sm:right-3 md:right-5 space-y-1.5 sm:space-y-2 md:space-y-3"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2 }}
              >
                {[
                  { text: "New Match!", icon: "💕", color: "bg-[#7C1835]", textColor: "text-white" },
                  { text: "Message", icon: "💌", color: "bg-[#2B171D]", textColor: "text-[#F6D1DA]" },
                  { text: "Liked", icon: "👍", color: "bg-[#C88B7B]", textColor: "text-[#2B171D]" },
                ].map((notification, index) => (
                  <motion.div
                    key={index}
                    className={`${notification.color} ${notification.textColor} px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-[#F6D1DA]/30`}
                    initial={{ scale: 0, x: 50 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 3 + index * 0.6, type: "spring" }}
                  >
                    <span className="text-xs sm:text-sm">{notification.icon}</span>
                    <span className="text-xs font-bold">{notification.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats Badge */}
              <motion.div
                className="absolute bottom-[-7%] left-2 sm:left-3 md:left-5 bg-[#FAF0F3] backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border border-[#F6D1DA]"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-[#F8F4EF] rounded-xl p-2.5">
                    <div className="text-lg sm:text-xl font-extrabold text-[#7C1835]">1.2K+</div>
                    <div className="text-[10px] text-[#2B171D] font-semibold">Matches</div>
                  </div>
                  <div className="bg-[#F8F4EF] rounded-xl p-2.5">
                    <div className="text-lg sm:text-xl font-extrabold text-[#A31D36]">99%</div>
                    <div className="text-[10px] text-[#2B171D] font-semibold">Verified</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= TRUST STATS ================= */}
      <section className="bg-[#FAF0F3] py-14 border-y border-[#F6D1DA]/60">
        <motion.div 
          className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Stat value="50K+" label="Active Calgary Members" />
          <Stat value="100%" label="Verified Profiles" />
          <Stat value="24/7" label="Privacy & Moderation" />
          <Stat value="Calgary" label="Exclusive Community" />
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-[#F8F4EF] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-14 text-[#2B171D]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose{" "}
            <span className="text-[#7C1835]">AdultMixer Calgary</span>?
          </motion.h2>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, staggerChildren: 0.2 }}
          >
            <Feature
              icon={<Users size={32} />}
              title="Smart Matching"
              text="Advanced algorithms connect you with like-minded Calgary adults based on real mutual interests."
              delay={0.2}
            />
            <Feature
              icon={<MessageCircle size={32} />}
              title="Instant Private Chat"
              text="Connect seamlessly with matches using a secure, confidential, and instant messaging experience."
              delay={0.4}
            />
            <Feature
              icon={<ShieldCheck size={32} />}
              title="Verified & Discreet"
              text="Every single profile is verified for absolute authenticity, privacy, and safety."
              delay={0.6}
            />
          </motion.div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-[#FAF0F3] py-20 border-t border-[#F6D1DA]/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-14 text-[#2B171D]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-10 text-center">
            <Step
              number="1"
              title="Create Your Profile"
              text="Sign up in seconds and curate a sophisticated profile that highlights your true personality."
              delay={0.2}
            />
            <Step
              number="2"
              title="Discover Local Matches"
              text="Browse compatible singles across Calgary filtered by location and personal preferences."
              delay={0.4}
            />
            <Step
              number="3"
              title="Connect & Meet"
              text="Initiate conversations and meet up with confidence and peace of mind."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* ================= SAFETY ================= */}
      <section className="bg-[#F8F4EF] py-24 border-t border-[#F6D1DA]/50 relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#F6D1DA]/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#FAF0F3] p-8 md:p-12 rounded-3xl border border-[#F6D1DA] shadow-xl relative"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C1835]/10 text-[#7C1835] text-xs font-bold uppercase tracking-wider mb-5 border border-[#7C1835]/20">
              <ShieldCheck size={14} className="text-[#7C1835]" /> Safety & Discretion
            </span>

            <motion.h2 
              className="text-3xl md:text-4xl font-extrabold mb-6 text-[#7C1835] leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Your Safety & Privacy Come First
            </motion.h2>

            <p className="text-[#4A353B] text-base md:text-lg mb-8 leading-relaxed font-medium">
              AdultMixer Calgary is built with discretion, security, and mutual respect at its core.
              We enforce strict moderation policies and advanced data encryption to safeguard your private experience.
            </p>

            <motion.ul 
              className="space-y-4 text-[#2B171D]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.li 
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/70 border border-[#F6D1DA]/60 hover:border-[#7C1835]/30 transition-all shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C1835] text-white flex items-center justify-center shadow-md shrink-0">
                  <Lock size={20} />
                </div>
                <span className="font-bold text-sm md:text-base text-[#2B171D]">End-to-end data encryption & privacy protection</span>
              </motion.li>

              <motion.li 
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/70 border border-[#F6D1DA]/60 hover:border-[#7C1835]/30 transition-all shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C1835] text-white flex items-center justify-center shadow-md shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <span className="font-bold text-sm md:text-base text-[#2B171D]">Human-verified authentic profile moderation</span>
              </motion.li>

              <motion.li 
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/70 border border-[#F6D1DA]/60 hover:border-[#7C1835]/30 transition-all shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C1835] text-white flex items-center justify-center shadow-md shrink-0">
                  <MapPin size={20} />
                </div>
                <span className="font-bold text-sm md:text-base text-[#2B171D]">Exclusively Calgary local verified community</span>
              </motion.li>
            </motion.ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl gradient-brand opacity-25 blur-2xl"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="/safety_privacy.jpg"
                alt="Safety and Privacy - Relatable Modest Calgary Couple"
                className="w-full h-[450px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              
              {/* Floating verified badge overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#F6D1DA] shadow-xl flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7C1835] to-[#A31D36] text-white flex items-center justify-center shadow-md shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#7C1835] uppercase tracking-wider">100% Verified Community</p>
                  <p className="text-xs text-[#2B171D] font-medium">Genuine Calgary Singles & Couples</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative gradient-brand text-white py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">
            Ready to Meet Someone Special?
          </h2>

          <p className="mt-4 text-lg text-[#F8F4EF]/90 max-w-2xl mx-auto">
           Join Adultmixer Calgary today and discover an inclusive, exciting community waiting for you.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/signup"
              className="inline-block mt-8 btn-secondary px-9 py-4 rounded-xl font-bold text-lg shadow-xl"
            >
              Join Now
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Feature = ({ icon, title, text, delay = 0 }) => (
  <motion.div 
    className="bg-[#FAF0F3] p-8 rounded-2xl border border-[#F6D1DA] shadow-sm hover:shadow-md transition text-center"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.03, y: -4 }}
  >
    <div className="text-[#7C1835] mb-5 flex justify-center p-3 bg-[#F8F4EF] w-16 h-16 rounded-2xl mx-auto items-center border border-[#F6D1DA]">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#2B171D] mb-3">{title}</h3>
    <p className="text-[#6B545A] leading-relaxed text-sm">{text}</p>
  </motion.div>
);

const Step = ({ number, title, text, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    <motion.div 
      className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-[#7C1835] text-white font-bold text-xl mb-4 shadow-md"
      whileHover={{ scale: 1.1, rotate: 360 }}
      transition={{ duration: 0.5 }}
    >
      {number}
    </motion.div>
    <h3 className="text-xl font-bold text-[#2B171D] mb-2">{title}</h3>
    <p className="text-[#6B545A] text-sm leading-relaxed max-w-xs mx-auto">{text}</p>
  </motion.div>
);

const Stat = ({ value, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.05 }}
  >
    <h3 className="text-3xl md:text-4xl font-extrabold text-[#7C1835]">{value}</h3>
    <p className="text-[#2B171D] font-semibold text-sm mt-2">{label}</p>
  </motion.div>
);

export default HeroSection;
