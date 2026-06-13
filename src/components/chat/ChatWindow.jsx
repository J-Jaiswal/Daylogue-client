import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

const SUGGESTED_QUESTIONS = [
  "Am I sleeping enough for my current goals?",
  "How is my diet looking this week?",
  "What should I focus on improving?",
  "Is my workout frequency good enough?",
  "What pattern stands out from my recent logs?",
];

export default function ChatWindow({
  messages,
  loading,
  onSuggestedQuestion,
  userName,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-window">
      {messages.length === 0 && (
        <div className="chat-empty">
          <div className="chat-empty-icon">🤖</div>
          <p>
            Hey {userName}, ask me anything about your health, sleep, workouts,
            or diet.
          </p>
          <p className="chat-empty-hint">
            I have context from your last 14 days of logs.
          </p>

          <div className="suggested-questions">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="suggested-question-btn"
                onClick={() => onSuggestedQuestion(q)}
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <ChatMessage key={i} message={msg} />
      ))}

      {loading && (
        <div className="chat-message ai-message">
          <div className="ai-message-icon">🤖</div>
          <div className="message-bubble typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
