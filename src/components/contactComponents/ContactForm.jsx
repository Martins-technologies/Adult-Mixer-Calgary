import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { submitContactMessage } from "../../services/api";

const ContactForm = () => {
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
        !err.response && err.message === "Network Error"
          ? "Unable to reach the server. Make sure the backend is running."
          : err.response?.data?.message || "Failed to send message. Please try again.";
      setSubmitStatus({ type: "error", message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster />
      <motion.section
        className="max-w-5xl mx-auto bg-[#FAF0F3] p-10 rounded-3xl shadow-xl border border-[#F6D1DA] px-8 mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-3xl font-extrabold text-[#7C1835] text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Send Us a Message
        </motion.h2>

        <motion.form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {submitStatus && (
            <motion.div
              className={`md:col-span-2 flex items-center gap-3 p-4 rounded-xl text-sm font-semibold ${
                submitStatus.type === "success"
                  ? "bg-[#FAF0F3] text-[#7C1835] border border-[#F6D1DA]"
                  : "bg-[#A31D36]/10 text-[#A31D36] border border-[#A31D36]/30"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-[#7C1835]" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#A31D36]" />
              )}
              {submitStatus.message}
            </motion.div>
          )}

          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <label className="text-[#2B171D] font-semibold mb-2">Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-[#F6D1DA] bg-white focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D] font-medium"
            />
          </motion.div>

          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <label className="text-[#2B171D] font-semibold mb-2">Your Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-[#F6D1DA] bg-white focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D] font-medium"
            />
          </motion.div>

          <motion.div
            className="flex flex-col md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <label className="text-[#2B171D] font-semibold mb-2">Message</label>
            <textarea
              name="message"
              rows="6"
              placeholder="Write your message..."
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-[#F6D1DA] bg-white focus:ring-2 focus:ring-[#7C1835] outline-none text-[#2B171D] font-medium"
            ></textarea>
          </motion.div>

          <motion.div
            className="md:col-span-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-10 py-3.5 btn-primary text-white text-lg font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
            >
              {isSubmitting ? "Sending..." : "Submit Secure Message"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.section>
    </>
  );
};

export default ContactForm;
