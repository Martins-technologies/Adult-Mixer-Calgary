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
          ? "Unable to reach the server. Make sure the backend is running (npm --prefix backend run dev)."
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
        className="max-w-5xl mx-auto bg-white p-10 rounded-3xl shadow-xl px-6 mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-3xl font-bold text-gray-800 text-center mb-10"
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
              className={`md:col-span-2 flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
            <label className="text-gray-700 font-semibold mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </motion.div>

          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <label className="text-gray-700 font-semibold mb-1">Your Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </motion.div>

          <motion.div
            className="flex flex-col md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <label className="text-gray-700 font-semibold mb-1">Message</label>
            <textarea
              name="message"
              rows="6"
              placeholder="Write your message..."
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              className="px-10 py-3 bg-pink-600 text-white text-lg font-bold rounded-xl hover:bg-pink-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.section>
    </>
  );
};

export default ContactForm;
