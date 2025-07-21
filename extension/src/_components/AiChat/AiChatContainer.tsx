import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, MoreHorizontal, Plus, X } from "lucide-react";
import AiChatMessageCard from "./AiChatMessageCard";
import AiChatMessageForm from "./AiChatMessageForm";
import AiChatMessageLoading from "./AiChatMessageLoading";
import { generateCode } from "../../utils/api";
import config from "../../config/environment";

interface Fragment {
  id: string;
  title: string;
  sandboxUrl: string;
  files: Record<string, string>;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  fragment?: Fragment | null;
  type?: "RESULT" | "ERROR";
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
  const [contextData, setContextData] = useState<string>("");
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

    try {
      // Prepare the full message with context if available
      let fullMessage = message.trim();
      if (contextData) {
        fullMessage = `Context: ${contextData}\n\nUser Request: ${message.trim()}`;
      }

      // Call the API to generate code
      const result = await generateCode(fullMessage);

      if (result.status === 200 && result.data) {
        // Success - add assistant message with fragment
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I've generated the code for you! Here's what I created:",
          role: "assistant",
          timestamp: new Date(),
          type: "RESULT",
          fragment: {
            id: result.data.projectId,
            title: "Generated Component",
            sandboxUrl: `${config.APP_URL}/projects/${result.data.projectId}`,
            files: {},
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else if (result.status === 429) {
        // Rate limit exceeded
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "You have run out of credits. Please upgrade your plan to continue using AI features.",
          role: "assistant",
          timestamp: new Date(),
          type: "ERROR",
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Other error
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Error: ${result.error || "Failed to generate code"}`,
          role: "assistant",
          timestamp: new Date(),
          type: "ERROR",
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error in AI chat:", error);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, something went wrong. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        type: "ERROR",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsPending(false);
    }
  };

  // Handle context scraping
  const handleContextScraping = async () => {
    if (!onCodeContextScraping) return;

    // Add a loading message to indicate context is being captured
    const loadingMessage: Message = {
      id: Date.now().toString(),
      content: "Capturing page context...",
      role: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Call the context scraping function
      onCodeContextScraping();

      // Simulate a delay to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Capture the current page's HTML structure
      const pageContext = capturePageContext();
      setContextData(pageContext);

      // Update the loading message with success
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content:
                  "Page context captured successfully! You can now ask questions about the current page.",
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error capturing context:", error);

      // Update the loading message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: "Failed to capture page context. Please try again.",
              }
            : msg
        )
      );
    }
  };

  // Function to capture the current page's context
  const capturePageContext = (): string => {
    try {
      const body = document.body;
      if (!body) return "";

      // Get the main content area (focus on the most relevant parts)
      const mainContent =
        body.querySelector("main") ||
        body.querySelector("#main") ||
        body.querySelector(".main") ||
        body;

      // Create a simplified representation of the page structure
      const context = {
        title: document.title,
        url: window.location.href,
        structure: extractPageStructure(mainContent),
        styles: extractKeyStyles(mainContent),
      };

      return JSON.stringify(context, null, 2);
    } catch (error) {
      console.error("Error capturing page context:", error);
      return "";
    }
  };

  // Extract the page structure
  const extractPageStructure = (element: HTMLElement): any => {
    const structure: any = {
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      id: element.id,
      children: [],
    };

    // Limit to first 10 children to avoid too much data
    const children = Array.from(element.children).slice(0, 10);

    children.forEach((child) => {
      if (child instanceof HTMLElement) {
        structure.children.push({
          tagName: child.tagName.toLowerCase(),
          className: child.className,
          id: child.id,
          textContent: child.textContent?.slice(0, 100), // Limit text content
        });
      }
    });

    return structure;
  };

  // Extract key styles from the page
  const extractKeyStyles = (element: HTMLElement): any => {
    const styles: any = {};

    try {
      const computedStyle = window.getComputedStyle(element);
      const keyProperties = [
        "font-family",
        "font-size",
        "color",
        "background-color",
        "display",
        "position",
      ];

      keyProperties.forEach((prop) => {
        styles[prop] = computedStyle.getPropertyValue(prop);
      });
    } catch (error) {
      console.error("Error extracting styles:", error);
    }

    return styles;
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
            {contextData && (
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "12px",
                  color: "#4169e1",
                  fontWeight: "normal",
                }}
              >
                • Context ready
              </span>
            )}
          </div>

          {/* Plus icon button (context scraping) */}
          <button
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              color: contextData ? "#4169e1" : "#bdbdbd",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              outline: "none",
            }}
            aria-label={
              contextData
                ? "Context captured - click to recapture"
                : "Add context"
            }
            tabIndex={0}
            onClick={handleContextScraping}
          >
            <Plus size={16} />
          </button>

          {/* Clear context button (only show when context is available) */}
          {contextData && (
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
              aria-label="Clear context"
              tabIndex={0}
              onClick={() => setContextData("")}
            >
              <X size={14} />
            </button>
          )}

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
              fragment={message.fragment}
              type={message.type}
            />
          ))}
          {isPending && <AiChatMessageLoading />}
          <div ref={bottomRef} />
        </div>
      </div>

      <AiChatMessageForm
        onSubmit={handleSubmit}
        isPending={isPending}
        hasContext={!!contextData}
      />
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
