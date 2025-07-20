import React from "react";

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

const UserMessage: React.FC<UserMessageProps> = ({ content, timestamp }) => {
  return (
    <div style={userMessageStyles.container}>
      <div style={userMessageStyles.message}>{content}</div>
    </div>
  );
};

interface AssistantMessageProps {
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  timestamp,
  isLoading = false,
}) => {
  return (
    <div style={assistantMessageStyles.container}>
      <div style={assistantMessageStyles.header}>
        <div style={assistantMessageStyles.avatar}>
          <div style={assistantMessageStyles.avatarIcon}>UI</div>
        </div>
        <span style={assistantMessageStyles.name}>UI Assistant</span>
        <span style={assistantMessageStyles.timestamp}>
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div style={assistantMessageStyles.content}>
        {isLoading ? (
          <div style={assistantMessageStyles.loading}>
            <div style={assistantMessageStyles.loadingDot}></div>
            <div style={assistantMessageStyles.loadingDot}></div>
            <div style={assistantMessageStyles.loadingDot}></div>
          </div>
        ) : (
          <span style={assistantMessageStyles.text}>{content}</span>
        )}
      </div>
    </div>
  );
};

interface AiChatMessageCardProps {
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
}

const AiChatMessageCard: React.FC<AiChatMessageCardProps> = ({
  content,
  role,
  timestamp,
  isLoading = false,
}) => {
  if (role === "assistant") {
    return (
      <AssistantMessage
        content={content}
        timestamp={timestamp}
        isLoading={isLoading}
      />
    );
  }

  return <UserMessage content={content} timestamp={timestamp} />;
};

const userMessageStyles = {
  container: {
    display: "flex",
    justifyContent: "flex-end",
    paddingBottom: "16px",
    paddingRight: "8px",
    paddingLeft: "40px",
  },
  message: {
    backgroundColor: "#4169e1",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "12px",
    maxWidth: "80%",
    wordBreak: "break-word" as const,
    fontSize: "14px",
    lineHeight: "1.4",
  },
};

const assistantMessageStyles = {
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
  text: {
    color: "#fff",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  loading: {
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
};

export default AiChatMessageCard;
