export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-message ${isUser ? "user-message" : "ai-message"}`}>
      {!isUser && <div className="ai-message-icon">🤖</div>}
      <div className="message-bubble">
        {message.content
          .split("\n")
          .map((line, i) => (line.trim() ? <p key={i}>{line}</p> : null))}
      </div>
    </div>
  );
}
