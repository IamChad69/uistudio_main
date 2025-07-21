import React, { useEffect, useState } from "react";

const AiChatMessageLoading: React.FC = () => {
  const messages = [
    "Thinking...",
    "Analyzing your request...",
    "Generating components...",
    "Crafting the perfect UI...",
    "Optimizing layout...",
    "Adding finishing touches...",
    "Almost ready...",
    "Finalizing your component...",
    "Creating responsive design...",
    "Applying best practices...",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatar}>
          <div style={styles.avatarIcon}>UI</div>
        </div>
        <span style={styles.name}>UI Assistant</span>
        <span style={styles.timestamp}>
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div style={styles.content}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingDots}>
            <div style={styles.loadingDot}></div>
            <div style={styles.loadingDot}></div>
            <div style={styles.loadingDot}></div>
          </div>
          <div style={styles.loadingText}>{messages[currentMessageIndex]}</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    paddingBottom: "16px",
    paddingLeft: "8px",
    paddingRight: "40px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    paddingLeft: "8px",
  },
  avatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#4169e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarIcon: {
    color: "#fff",
    fontSize: "10px",
    fontWeight: "600",
  },
  name: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
    fontStyle: "italic",
  },
  timestamp: {
    color: "#bdbdbd",
    fontSize: "10px",
    marginLeft: "auto",
  },
  content: {
    paddingLeft: "32px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    alignItems: "flex-start",
  },
  loadingDots: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },
  loadingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#bdbdbd",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  loadingText: {
    color: "#bdbdbd",
    fontSize: "12px",
    fontStyle: "italic",
    animation: "fadeInOut 2s ease-in-out infinite",
  },
};

export default AiChatMessageLoading;
