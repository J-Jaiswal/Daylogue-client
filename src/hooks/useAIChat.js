import { useState } from "react";
import toast from "react-hot-toast";
import { aiApi } from "../api/aiApi";
import { useAuth } from "../hooks/useAuth";

const getReplyContent = (data) =>
  data?.reply || data?.message || data?.response || data?.content || "";

export const useAIChat = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content) => {
    const text = content.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const conversationHistory = [...messages, userMessage];

    setMessages(conversationHistory);
    setLoading(true);

    try {
      const data = await aiApi.chat(token, text, conversationHistory);
      const reply = getReplyContent(data);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply || "I couldn't generate a response right now.",
        },
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
      setMessages((current) => current.filter((msg) => msg !== userMessage));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return { messages, loading, sendMessage, clearChat };
};
