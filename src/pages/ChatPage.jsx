import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAIChat } from "../hooks/useAIChat";

const SUGGESTED_QUESTIONS = [
  "Am I sleeping enough for my current goals?",
  "How is my diet looking this week?",
  "What should I focus on improving?",
  "Is my workout frequency good enough?",
  "What pattern stands out from my recent logs?",
];

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`coach-msg ${isUser ? "coach-msg--user" : "coach-msg--ai"}`}>
      {!isUser && (
        <div className="coach-ai-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            <circle cx="9" cy="13" r="1"/>
            <circle cx="15" cy="13" r="1"/>
          </svg>
        </div>
      )}
      <div className="coach-bubble">
        {message.content
          .split("\n")
          .map((line, i) => (line.trim() ? <p key={i}>{line}</p> : null))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const { messages, loading, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [input]);

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

  const hasMessages = messages.length > 0;

  return (
    <div className="coach-page">
      {/* Header */}
      <div className="coach-header">
        <div className="coach-header-left">
          <h1 className="coach-title">AI Coach</h1>
          <p className="coach-subtitle">Context from your last 14 days of logs</p>
        </div>
        {hasMessages && (
          <button className="coach-clear-btn" onClick={clearChat}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      <div className="coach-tab-divider" />

      {/* Messages area */}
      <div className="coach-messages">
        {!hasMessages && (
          <div className="coach-empty">
            <div className="coach-empty-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                <circle cx="9" cy="13" r="1"/>
                <circle cx="15" cy="13" r="1"/>
              </svg>
            </div>
            <p className="coach-empty-greeting">
              Hey {user?.name?.split(" ")[0] || "there"} — ask me anything.
            </p>
            <p className="coach-empty-hint">
              I know your sleep, workouts, and nutrition from the past two weeks.
            </p>

            <div className="coach-suggestions">
              <span className="coach-suggestions-label">Try asking</span>
              <div className="coach-suggestion-list">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="coach-suggestion-btn"
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                  >
                    <span className="coach-suggestion-arrow">→</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="coach-msg coach-msg--ai">
            <div className="coach-ai-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                <circle cx="9" cy="13" r="1"/>
                <circle cx="15" cy="13" r="1"/>
              </svg>
            </div>
            <div className="coach-bubble coach-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="coach-input-wrap">
        <div className="coach-input-bar">
          <textarea
            ref={textareaRef}
            className="coach-input"
            rows={1}
            placeholder="Ask your coach…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="coach-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>
        <p className="coach-input-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
