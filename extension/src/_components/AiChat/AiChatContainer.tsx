import React, { useEffect, useRef, useState } from "react";
import { Code2Icon, MoreHorizontal, Plus, X } from "lucide-react";
import AiChatMessageCard from "./AiChatMessageCard";
import AiChatMessageForm from "./AiChatMessageForm";
import AiChatMessageLoading from "./AiChatMessageLoading";
import { generateCode } from "../../utils/api";
import LogoIcon from "../../assets/icons/logo-icon.svg";
import config from "../../config/environment";

interface Fragment {
  id: string;
  title: string;
  sandboxUrl: string;
  files: Record<string, string>;
  generatedCode?: string; // Store the generated code for copying
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  fragment?: Fragment | null;
  type?: "RESULT" | "ERROR";
}

interface ComponentData {
  tagName: string;
  id: string;
  classNames: string;
  text: string;
  attributes: Record<string, string>;
  styles: Record<string, string>;
  tailwindClasses: string;
  mediaQueries: Record<string, Record<string, string>>;
  xpath: string;
  cssSelector: string;
  innerHtml: string;
  outerHtml: string;
  isFromIframe: boolean;
  iframeSrc?: string;
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
  const [contextData, setContextData] = useState<ComponentData | null>(null);
  const [isContextScraping, setIsContextScraping] = useState(false);
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
        fullMessage = `Component Context:\n${formatComponentData(contextData)}\n\nUser Request: Create a React component based on this: ${message.trim()}`;
      } else {
        // Ensure we're always requesting component generation, not webpage generation
        fullMessage = `Create a React component: ${message.trim()}`;
      }

      // Call the API to generate code
      const result = await generateCode(fullMessage);

      if (result.status === 200 && result.data) {
        // Generate a simple React component based on the user's request
        const componentName = "GeneratedComponent";
        const generatedCode = `import React from 'react';

interface ${componentName}Props {
  // Add your props here
}

const ${componentName}: React.FC<${componentName}Props> = ({}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Generated Component
      </h2>
      <p className="text-gray-600">
        This is a React component generated based on your request.
      </p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
        Click me
      </button>
    </div>
  );
};

export default ${componentName};`;

        // Success - add assistant message with fragment
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "🎉 I've created a React component for you! Here's what I built:",
          role: "assistant",
          timestamp: new Date(),
          type: "RESULT",
          fragment: {
            id: result.data.projectId,
            title: "Component",
            sandboxUrl: `${config.APP_URL}/projects/${result.data.projectId}`,
            files: {
              [`${componentName}.tsx`]: generatedCode,
            },
            generatedCode: generatedCode,
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
    if (isContextScraping) return;

    setIsContextScraping(true);

    // Add a loading message to indicate context is being captured
    const loadingMessage: Message = {
      id: Date.now().toString(),
      content:
        "🎯 **Component Capture Mode Active**\n\nClick on any component on the page to capture it as context. I'll then be able to help you create a React component based on it.\n\n*You have 10 seconds to select a component...*",
      role: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Call the context scraping function to start the scraper
      if (onCodeContextScraping) {
        onCodeContextScraping();
      }

      // Set up a listener for when an element is selected
      const handleElementSelected = (event: Event) => {
        const customEvent = event as CustomEvent;
        const elementData = customEvent.detail as ComponentData;

        // Stop the scraper
        document.dispatchEvent(new CustomEvent("uiScraper:stopScraping"));

        // Update context data
        setContextData(elementData);

        // Update the loading message with success
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: `Context Added!`,
                }
              : msg
          )
        );

        setIsContextScraping(false);

        // Remove the event listener
        document.removeEventListener(
          "uiScraper:elementSelected",
          handleElementSelected
        );
      };

      // Listen for element selection
      document.addEventListener(
        "uiScraper:elementSelected",
        handleElementSelected
      );

      // Set a timeout to stop scraping if no element is selected
      setTimeout(() => {
        if (isContextScraping) {
          // Update the loading message with timeout
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessage.id
                ? {
                    ...msg,
                    content:
                      "⏰ **Capture Timeout**\n\nNo component was selected within 10 seconds. Click the + button again to restart context capture mode.",
                  }
                : msg
            )
          );
          setIsContextScraping(false);
          document.removeEventListener(
            "uiScraper:elementSelected",
            handleElementSelected
          );
        }
      }, 10000); // 10 second timeout
    } catch (error) {
      console.error("Error capturing context:", error);

      // Update the loading message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content:
                  "❌ **Capture Failed**\n\nThere was an error capturing the component context. Please try clicking the + button again.",
              }
            : msg
        )
      );
      setIsContextScraping(false);
    }
  };

  // Format component data for AI context
  const formatComponentData = (data: ComponentData): string => {
    return `HTML Structure:
${data.outerHtml}

CSS Styles:
${Object.entries(data.styles)
  .map(([property, value]) => `${property}: ${value};`)
  .join("\n")}

Tailwind Classes:
${data.tailwindClasses}

Element Info:
- Tag: ${data.tagName}
- ID: ${data.id || "none"}
- Classes: ${data.classNames || "none"}
- Text Content: ${data.text || "none"}

CSS Selector: ${data.cssSelector}
XPath: ${data.xpath}

Media Queries:
${Object.entries(data.mediaQueries)
  .map(
    ([query, styles]) =>
      `${query}:\n${Object.entries(styles)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join("\n")}`
  )
  .join("\n\n")}`;
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
              <div
                style={{
                  marginLeft: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#4169e1",
                  fontWeight: "normal",
                }}
              >
                <Code2Icon size={16} />
                <span>Context Added</span>
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
                  onClick={() => setContextData(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Plus icon button (context scraping) */}
          <button
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              color: isContextScraping
                ? "#ff6b6b"
                : contextData
                  ? "#4169e1"
                  : "#bdbdbd",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              outline: "none",
            }}
            aria-label={
              isContextScraping
                ? "Click on a component to capture..."
                : contextData
                  ? "Component captured - click to recapture"
                  : "Capture component context"
            }
            tabIndex={0}
            onClick={handleContextScraping}
            disabled={isContextScraping}
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