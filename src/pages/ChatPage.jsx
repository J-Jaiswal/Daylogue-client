import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAIChat } from "../hooks/useAIChat";
import ChatWindow from "../components/chat/ChatWindow";

export default function ChatPage() {
  const { user } = useAuth();
  const { messages, loading, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page chat-page">
      <div className="chat-header">
        <h2 className="page-title">AI Coach</h2>
        {messages.length > 0 && (
          <button className="btn-ghost" onClick={clearChat}>
            Clear
          </button>
        )}
      </div>

      <ChatWindow
        messages={messages}
        loading={loading}
        onSuggestedQuestion={sendMessage}
        userName={user?.name}
      />

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          rows={1}
          placeholder="Ask your AI coach..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
