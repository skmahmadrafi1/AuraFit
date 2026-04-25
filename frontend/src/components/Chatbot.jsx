import { useState, useRef, useEffect, useCallback } from "react";

const BOT_AVATAR = "🤖";
const USER_AVATAR = "👤";

const QUICK_PROMPTS = [
  "💪 Best workout for beginners?",
  "🥗 High-protein meal ideas",
  "😴 How to improve sleep?",
  "🔥 How to lose belly fat?",
  "🧘 Stress relief exercises",
];

const TypingDots = () => (
  <div style={styles.typingWrap}>
    <span style={{ ...styles.dot, animationDelay: "0ms" }} />
    <span style={{ ...styles.dot, animationDelay: "200ms" }} />
    <span style={{ ...styles.dot, animationDelay: "400ms" }} />
  </div>
);

const Message = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{ ...styles.msgRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && <div style={styles.avatar}>{BOT_AVATAR}</div>}
      <div
        style={{
          ...styles.bubble,
          ...(isUser ? styles.userBubble : styles.botBubble),
        }}
      >
        {msg.content}
        <div style={styles.timestamp}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      {isUser && <div style={styles.avatar}>{USER_AVATAR}</div>}
    </div>
  );
};

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm AuraFit AI 💪 Your personal fitness & wellness coach. Ask me anything about workouts, nutrition, or healthy habits!",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text) => {
      const content = (text || input).trim();
      if (!content || loading) return;

      const userMsg = { role: "user", content, ts: Date.now() };
      const history = [...messages, userMsg];

      setMessages(history);
      setInput("");
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await res.json();
        const botMsg = {
          role: "assistant",
          content: data.reply || "Sorry, I couldn't process that. Try again!",
          ts: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (!open) setUnread((u) => u + 1);
      } catch {
        setError("Connection error. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, open]
  );

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared! What can I help you with? 💪",
        ts: Date.now(),
      },
    ]);
    setError("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        style={{
          ...styles.fab,
          transform: open ? "scale(0.9) rotate(10deg)" : "scale(1) rotate(0deg)",
        }}
        onClick={() => setOpen((o) => !o)}
        title="AuraFit AI"
        aria-label="Open AI Chat"
      >
        {open ? "✕" : "🤖"}
        {unread > 0 && !open && (
          <span style={styles.unreadBadge}>{unread}</span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={styles.window}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.headerAvatar}>🤖</div>
              <div>
                <div style={styles.headerTitle}>AuraFit AI</div>
                <div style={styles.headerSub}>
                  <span style={styles.onlineDot} /> Always here to help
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.iconBtn} onClick={clearChat} title="Clear chat">
                🗑
              </button>
              <button style={styles.iconBtn} onClick={() => setOpen(false)} title="Close">
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={styles.msgList}>
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}
            {loading && (
              <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
                <div style={styles.avatar}>{BOT_AVATAR}</div>
                <div style={{ ...styles.bubble, ...styles.botBubble }}>
                  <TypingDots />
                </div>
              </div>
            )}
            {error && (
              <div style={styles.errorMsg}>⚠️ {error}</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div style={styles.quickWrap}>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  style={styles.quickBtn}
                  onClick={() => sendMessage(p)}
                  disabled={loading}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={styles.inputArea}>
            <textarea
              ref={inputRef}
              style={styles.textarea}
              placeholder="Ask about workouts, nutrition, sleep..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              maxLength={2000}
              disabled={loading}
            />
            <button
              style={{
                ...styles.sendBtn,
                opacity: !input.trim() || loading ? 0.5 : 1,
                cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Send"
            >
              ➤
            </button>
          </div>
          <div style={styles.footer}>
            Powered by OpenRouter · AuraFit AI
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPulse { 0%,100%{opacity:0.3;transform:scale(0.7)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </>
  );
};

// ─── Inline Styles ────────────────────────────────────────────────────────────
const styles = {
  fab: {
    position: "fixed",
    bottom: 28,
    right: 28,
    zIndex: 9000,
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none",
    fontSize: 26,
    cursor: "pointer",
    boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
    transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s",
    animation: "pulse 3s ease-in-out infinite",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    background: "#ef4444",
    color: "#fff",
    borderRadius: "50%",
    width: 20,
    height: 20,
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  window: {
    position: "fixed",
    bottom: 100,
    right: 28,
    zIndex: 9001,
    width: 380,
    maxWidth: "calc(100vw - 40px)",
    height: 580,
    maxHeight: "calc(100vh - 120px)",
    background: "linear-gradient(160deg, #0f0f1e 0%, #1a1a2e 100%)",
    border: "1px solid rgba(168,85,247,0.25)",
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.1)",
    animation: "slideUp 0.3s cubic-bezier(.34,1.56,.64,1)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    background: "rgba(124,58,237,0.15)",
    borderBottom: "1px solid rgba(168,85,247,0.15)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    fontFamily: "system-ui, sans-serif",
  },
  headerSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    boxShadow: "0 0 6px #22c55e",
  },
  iconBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    borderRadius: 8,
    padding: "5px 9px",
    cursor: "pointer",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    transition: "background 0.15s",
  },
  msgList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(168,85,247,0.3) transparent",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
  },
  avatar: {
    fontSize: 20,
    flexShrink: 0,
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    maxWidth: "78%",
    padding: "10px 14px",
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.55,
    fontFamily: "system-ui, -apple-system, sans-serif",
    wordBreak: "break-word",
    position: "relative",
  },
  userBubble: {
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.88)",
    borderBottomLeftRadius: 4,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.45,
    marginTop: 4,
    textAlign: "right",
  },
  typingWrap: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    height: 18,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#a855f7",
    display: "inline-block",
    animation: "dotPulse 1.2s ease-in-out infinite",
  },
  errorMsg: {
    color: "#fca5a5",
    fontSize: 12,
    textAlign: "center",
    background: "rgba(239,68,68,0.1)",
    borderRadius: 8,
    padding: "8px 12px",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  quickWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    padding: "0 14px 10px",
    flexShrink: 0,
  },
  quickBtn: {
    background: "rgba(168,85,247,0.12)",
    border: "1px solid rgba(168,85,247,0.25)",
    borderRadius: 100,
    padding: "5px 12px",
    fontSize: 12,
    color: "#c084fc",
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
    fontFamily: "system-ui, sans-serif",
  },
  inputArea: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    padding: "10px 14px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(0,0,0,0.2)",
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "9px 12px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    resize: "none",
    fontFamily: "system-ui, sans-serif",
    lineHeight: 1.4,
    maxHeight: 100,
    overflowY: "auto",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none",
    color: "#fff",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.15s, transform 0.1s",
    flexShrink: 0,
  },
  footer: {
    textAlign: "center",
    fontSize: 10,
    color: "rgba(255,255,255,0.2)",
    padding: "6px 0 8px",
    fontFamily: "system-ui, sans-serif",
    flexShrink: 0,
  },
};

export default Chatbot;
