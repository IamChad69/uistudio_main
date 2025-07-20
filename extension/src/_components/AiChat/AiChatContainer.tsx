import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, MoreHorizontal, Plus, X } from "lucide-react";
import AiChatMessageCard from "./AiChatMessageCard";
import AiChatMessageForm from "./AiChatMessageForm";
import AiChatMessageLoading from "./AiChatMessageLoading";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface AiChatContainerProps {
  open: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onCodeContextScraping?: () => void;
}

const AiChatContainer: React.FC<AiChatContainerProps> = ({
  open,
  onClose,
  position,
  onCodeContextScraping,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isLeftSide, setIsLeftSide] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Determine if chat should be on the left or right side
  useEffect(() => {
    const windowWidth = window.innerWidth;
    const buttonCenterX = position.x;
    setIsLeftSide(buttonCenterX < windowWidth / 2);
  }, [position.x]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (message: string) => {
    if (!message.trim() || isPending) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsPending(true);

    // TODO: Add AI chat functionality here
    console.log("AI Chat message:", message);

    // Simulate API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "This is a sample response from the UI Assistant. The actual AI functionality will be implemented later.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsPending(false);
    }, 2000);
  };

  // Calculate position relative to the button
  const getChatPosition = () => {
    if (!position) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const chatWidth = 400;
    const chatHeight = 300;
    const padding = 20;

    // Position the chat to the left of the button
    let right = window.innerWidth - position.x + 20;
    let bottom = window.innerHeight - position.y - 150;

    // Ensure chat doesn't go off-screen horizontally
    if (right < padding) right = padding;
    if (right + chatWidth > window.innerWidth - padding) {
      right = window.innerWidth - chatWidth - padding;
    }

    // Ensure chat doesn't go off-screen vertically
    if (bottom < padding) bottom = padding;
    if (bottom + chatHeight > window.innerHeight - padding) {
      bottom = window.innerHeight - chatHeight - padding;
    }

    return {
      right: `${right}px`,
      bottom: `${bottom}px`,
      transform: "none",
    };
  };

  if (!open) return null;

  return (
    <div style={{ ...styles.container, ...getChatPosition() }}>
      <div style={styles.header}>
        {/* Centered header with horizontal icon row, matching the provided image */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "flex-end",
            gap: "24px",
          }}
        >
          {/* Heading: UI Assistant */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              fontWeight: 600,
              fontSize: "15px",
              color: "#fff",
              letterSpacing: "0.01em",
              userSelect: "none",
              pointerEvents: "none",
            }}
            aria-label="UI Assistant"
            tabIndex={-1}
          >
            UI Assistant
          </div>

          {/* Plus icon button (context scraping) */}
          <button
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              color: "#bdbdbd",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              outline: "none",
            }}
            aria-label="Add context"
            tabIndex={0}
            disabled
          >
            <Plus size={16} />
          </button>

          {/* More (three dots) icon */}
          <button
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              color: "#bdbdbd",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              outline: "none",
            }}
            aria-label="More"
            tabIndex={0}
            disabled
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Close button */}
          <button
            style={{
              ...styles.closeButton,
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              color: "#bdbdbd",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              outline: "none",
            }}
            onClick={onClose}
            aria-label="Close"
            tabIndex={0}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        <div style={styles.messagesList}>
          {messages.map((message) => (
            <AiChatMessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}
          {isPending && <AiChatMessageLoading />}
          <div ref={bottomRef} />
        </div>
      </div>

      <AiChatMessageForm onSubmit={handleSubmit} isPending={isPending} />
    </div>
  );
};

const styles = {
  container: {
    position: "fixed" as const,
    width: "400px",
    maxWidth: "90vw",
    backgroundColor: "#000000",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    zIndex: 2147483647,
    display: "flex",
    flexDirection: "column" as const,
    maxHeight: "80vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 16px 12px 16px",
    borderBottom: "1px solid #23272f",
    flexShrink: 0,
  },
  title: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    margin: 0,
  },
  closeButton: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    transition: "background 0.2s",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto" as const,
    minHeight: 0,
  },
  messagesList: {
    padding: "8px 0",
  },
  contextSection: {
    padding: "0 16px 16px 16px",
    borderTop: "1px solid #23272f",
    paddingTop: "12px",
    flexShrink: 0,
  },
  contextButton: {
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "rgba(65, 105, 225, 0.1)",
    border: "1px solid #4169e1",
    borderRadius: "6px",
    color: "#4169e1",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
    transition: "all 0.2s",
  },
};

export default AiChatContainer;
