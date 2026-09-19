// Updated UI - v3.0 with animated background theme
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Smile,
  Image,
  Camera,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [matchData, setMatchData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages] = useState([
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=500",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500",
  ]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      setLoading(false);
      setError("Please log in to view chat");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    if (!id) {
      setLoading(false);
      setError("Invalid chat");
      return;
    }

    const fetchChatData = async () => {
      try {
        setLoading(true);
        setError(null);

        const matchResponse = await api.get(`/messages/match/${id}`);
        setMatchData(matchResponse.data);

        const messagesResponse = await api.get(
          `/messages/${matchResponse.data.matchId}`,
        );
        setMessages(messagesResponse.data);
      } catch (error) {
        console.error("Failed to load chat:", error);
        const errorMsg =
          error.response?.status === 404
            ? "You can only chat after you both like each other. Like their profile first!"
            : error.response?.data?.message || "Failed to load chat";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id, currentUser, authLoading, navigate]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending || !matchData) return;

    const messageContent = text.trim();
    setText("");
    setSending(true);

    try {
      const response = await api.post("/messages", {
        matchId: matchData.matchId,
        content: messageContent,
      });

      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
      setText(messageContent);
    } finally {
      setSending(false);
      // Refocus input after sending completes
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  const sendImage = async (imageUrl) => {
    if (sending || !matchData) return;

    setSending(true);
    setShowGallery(false);

    try {
      const response = await api.post("/messages", {
        matchId: matchData.matchId,
        content: `[Image: ${imageUrl}]`,
      });

      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Failed to send image:", error);
      alert("Failed to send image. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-xl text-gray-600">Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
        <p className="text-xl text-red-600 mb-4 text-center max-w-md">{error}</p>
        <div className="flex gap-3">
          {id && (
            <button
              onClick={() => navigate(`/profile/${id}`)}
              className="px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700"
            >
              View Profile
            </button>
          )}
          <button
            onClick={() => navigate("/matches")}
            className="px-6 py-2 border border-pink-300 text-pink-600 rounded-xl hover:bg-pink-50"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-xl text-gray-600 mb-4">Match not found</p>
        <button
          onClick={() => navigate("/matches")}
          className="px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700"
        >
          Back to Matches
        </button>
      </div>
    );
  }

  const otherUser = matchData.otherUser;
  const displayName =
    `${otherUser.firstName} ${otherUser.lastName || ""}`.trim();
  const profileImage =
    otherUser.profileImageUrl || "https://via.placeholder.com/150";

  return (
    <div className="min-h-screen pt-24 px-4 pb-10 relative overflow-hidden bg-[#F8F4EF] text-[#2B171D]">
      {/* Top Header */}
      <motion.div
        className="bg-[#FAF0F3] rounded-2xl shadow-md border border-[#F6D1DA] p-4 max-w-4xl mx-auto mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate("/matches")}
              className="text-[#2B171D] hover:bg-[#F6D1DA] p-2 rounded-full transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={22} />
            </motion.button>

            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/profile/${otherUser.id}`)}
            >
              <div className="relative">
                <img
                  src={
                    otherUser.profileImageUrl ||
                    "https://via.placeholder.com/150"
                  }
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#7C1835]"
                />
                {otherUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-[#2B171D] text-lg">
                  {displayName}
                </h3>
                <p className="text-xs text-[#6B545A] font-semibold">
                  {otherUser.isOnline ? "🟢 Online" : "⚫ Offline"}
                </p>
              </div>
            </div>
          </div>

          <motion.button
            className="text-[#2B171D] hover:bg-[#F6D1DA] p-2 rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreVertical size={20} />
          </motion.button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <motion.div
        ref={messagesContainerRef}
        className="bg-[#FAF0F3]/90 rounded-3xl shadow-lg border border-[#F6D1DA] p-6 max-w-4xl mx-auto mb-6 overflow-y-auto"
        style={{ minHeight: "500px", maxHeight: "calc(100vh - 350px)" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isImageMessage = msg.content.startsWith("[Image:");
            const imageUrl = isImageMessage
              ? msg.content.match(/\[Image: (.*)\]/)?.[1]
              : null;

            return (
              <motion.div
                key={msg.id}
                className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`max-w-xs lg:max-w-md`}>
                  {isImageMessage && imageUrl ? (
                    <motion.div
                      className={`rounded-2xl overflow-hidden shadow-md ${
                        isMe
                          ? "bg-[#7C1835]"
                          : "bg-white"
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={imageUrl}
                        alt="Shared"
                        className="w-full h-48 object-cover cursor-pointer"
                      />
                      <div
                        className={`px-3 py-2 text-xs ${isMe ? "text-[#F6D1DA]" : "text-[#6B545A]"}`}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className={`px-5 py-3 rounded-2xl shadow-sm ${
                        isMe
                          ? "bg-[#7C1835] text-white font-medium"
                          : "bg-white text-[#2B171D] border border-[#F6D1DA]"
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1.5 font-semibold ${isMe ? "text-[#F6D1DA]" : "text-[#6B545A]"}`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Input Area */}
      <motion.div
        className="bg-[#FAF0F3] rounded-2xl shadow-lg border border-[#F6D1DA] p-4 max-w-4xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setShowGallery(!showGallery)}
            className={`${showGallery ? "text-[#7C1835] bg-[#F6D1DA]" : "text-[#2B171D]"} hover:bg-[#F6D1DA] p-2.5 rounded-full transition`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image size={22} />
          </motion.button>
          <motion.button
            className="text-[#2B171D] hover:bg-[#F6D1DA] p-2.5 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Smile size={22} />
          </motion.button>
          <input
            ref={inputRef}
            className="flex-1 px-5 py-3 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#7C1835] transition text-[#2B171D] placeholder-[#6B545A] border border-[#F6D1DA]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            disabled={sending}
          />
          <motion.button
            onClick={sendMessage}
            disabled={sending || !text.trim()}
            className="btn-primary p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            whileHover={{ scale: sending ? 1 : 1.1 }}
            whileTap={{ scale: sending ? 1 : 0.95 }}
          >
            <Send size={20} />
          </motion.button>
        </div>

        {/* Gallery Popup */}
        <AnimatePresence>
          {showGallery && (
            <motion.div
              className="mt-4 p-4 bg-[#F8F4EF] rounded-2xl border border-[#F6D1DA]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="text-[#7C1835]" size={20} />
                  <h4 className="font-bold text-[#2B171D]">Share a photo</h4>
                </div>
                <motion.button
                  onClick={() => setShowGallery(false)}
                  className="text-[#2B171D] hover:bg-[#F6D1DA] p-1.5 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendImage(img)}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#7C1835]/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Send size={20} className="text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Chat;
