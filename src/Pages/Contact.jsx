import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, CheckCircle, AlertCircle, Shield, Lock, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { submitContactMessage } from "../services/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (submitStatus) setSubmitStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus({ type: "error", message: "Please fill in all fields." });
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      const response = await submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      setSubmitStatus({
        type: "success",
        message: response.data.message || "Message sent successfully!",
      });
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send message. Please try again.";
      setSubmitStatus({ type: "error", message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F8F4EF] text-[#2B171D] min-h-screen">
      <Toaster />
      
      {/* ================= HEADER ================= */}
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

      {/* ================= INFO CARDS ================= */}
      <motion.section 
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 -mt-12 mb-20 relative z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <InfoCard
          icon={<Mail size={32} className="text-[#7C1835]" />}
          title="Email Us"
          text="support@adultmixercalgary.com"
          delay={0.1}
        />
        <InfoCard
          icon={<Phone size={32} className="text-[#7C1835]" />}
          title="Call Us"
          text="+1 (587) 123-4567"
          delay={0.3}
        />
        <InfoCard
          icon={<MapPin size={32} className="text-[#7C1835]" />}
          title="Location"
          text="Calgary, Alberta, Canada"
          delay={0.5}
        />
      </motion.section>

      {/* ================= FORM + TEXT ================= */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-14 mb-24">
        {/* FORM */}
        <motion.div 
          className="bg-[#FAF0F3] p-8 md:p-10 rounded-3xl shadow-xl border border-[#F6D1DA]"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl font-extrabold text-[#7C1835] mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Send Us a Message
          </motion.h2>

          <motion.form
            className="space-y-5"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl text-sm font-semibold ${
                  submitStatus.type === "success"
                    ? "bg-[#FAF0F3] text-[#7C1835] border border-[#F6D1DA]"
                    : "bg-[#A31D36]/10 text-[#A31D36] border border-[#A31D36]/30"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-[#7C1835]" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#A31D36]" />
                )}
                {submitStatus.message}
              </motion.div>
            )}

            <div>
              <label className="block text-[#2B171D] font-semibold mb-1.5 text-sm">Full Name</label>
              <motion.input
                type="text"
                name="name"
                placeholder="Your Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#F6D1DA] bg-white focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D] font-medium"
                required
                disabled={isSubmitting}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              />
            </div>

            <div>
              <label className="block text-[#2B171D] font-semibold mb-1.5 text-sm">Email Address</label>
              <motion.input
                type="email"
                name="email"
                placeholder="Your Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#F6D1DA] bg-white focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D] font-medium"
                required
                disabled={isSubmitting}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              />
            </div>

            <div>
              <label className="block text-[#2B171D] font-semibold mb-1.5 text-sm">Your Message</label>
              <motion.textarea
                name="message"
                rows="5"
                placeholder="Write your message..."
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#F6D1DA] bg-white focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D] font-medium"
                required
                disabled={isSubmitting}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              ></motion.textarea>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-white py-3.5 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? "Sending..." : "Submit Secure Message"}
            </motion.button>

            <motion.p 
              className="text-xs text-[#6B545A] text-center mt-2 font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              Your information is private and will never be shared with third parties.
            </motion.p>
          </motion.form>
        </motion.div>

        {/* TEXT CONTENT */}
        <motion.div 
          className="flex flex-col justify-center space-y-6"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <motion.h3 
              className="text-3xl font-extrabold text-[#7C1835] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Safe. Private. Confidential.
            </motion.h3>
            <motion.p 
              className="text-[#6B545A] mb-6 leading-relaxed font-medium text-base"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              AdultMixer Calgary is a trusted adult dating platform focused on
              privacy, safety, and real connections. Our support team is trained
              to handle all inquiries discreetly and professionally.
            </motion.p>
            <motion.p 
              className="text-[#6B545A] leading-relaxed font-medium text-base"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              If you have concerns regarding account security, abuse reports, or
              privacy issues, please contact us immediately. Your safety matters
              to us.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-4 bg-[#FAF0F3] rounded-2xl border border-[#F6D1DA]">
              <div className="p-2.5 bg-[#7C1835] text-white rounded-xl">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[#2B171D] text-sm">Discreet Support</h4>
                <p className="text-xs text-[#6B545A]">100% Confidential</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#FAF0F3] rounded-2xl border border-[#F6D1DA]">
              <div className="p-2.5 bg-[#7C1835] text-white rounded-xl">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[#2B171D] text-sm">Secure Data</h4>
                <p className="text-xs text-[#6B545A]">Encrypted messages</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= MAP ================= */}
      <motion.section 
        className="max-w-6xl mx-auto px-6 mb-24"
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
          transition={{ delay: 0.2 }}
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
    </div>
  );
};

/* ================= SMALL COMPONENT ================= */

const InfoCard = ({ icon, title, text, delay = 0 }) => {
  return (
    <motion.div 
      className="bg-[#FAF0F3] p-8 rounded-2xl shadow-lg border border-[#F6D1DA] text-center hover:-translate-y-1 transition cursor-pointer"
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

export default Contact;
