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

interface Fragment {
  id: string;
  title: string;
  sandboxUrl: string;
  files: Record<string, string>;
}

interface AssistantMessageProps {
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  fragment?: Fragment | null;
  type?: "RESULT" | "ERROR";
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  timestamp,
  isLoading = false,
  fragment,
  type,
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
          <>
            <span
              style={{
                ...assistantMessageStyles.text,
                ...(type === "ERROR" && { color: "#ef4444" }),
              }}
            >
              {content}
            </span>

            {fragment && type === "RESULT" && (
              <FragmentCard fragment={fragment} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface FragmentCardProps {
  fragment: Fragment;
}

const FragmentCard: React.FC<FragmentCardProps> = ({ fragment }) => {
  const handleClick = () => {
    // Open the fragment in a new tab
    window.open(fragment.sandboxUrl, "_blank");
  };

  return (
    <div style={fragmentCardStyles.container}>
      <button
        style={fragmentCardStyles.button}
        onClick={handleClick}
        title="Open in sandbox"
      >
        <div style={fragmentCardStyles.content}>
          <div style={fragmentCardStyles.icon}>
            <span style={fragmentCardStyles.iconText}>⚛</span>
          </div>
          <div style={fragmentCardStyles.info}>
            <span style={fragmentCardStyles.title}>{fragment.title}.tsx</span>
          </div>
        </div>
        <div style={fragmentCardStyles.arrow}>→</div>
      </button>
    </div>
  );
};

interface AiChatMessageCardProps {
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
  fragment?: Fragment | null;
  type?: "RESULT" | "ERROR";
}

const AiChatMessageCard: React.FC<AiChatMessageCardProps> = ({
  content,
  role,
  timestamp,
  isLoading = false,
  fragment,
  type,
}) => {
  if (role === "assistant") {
    return (
      <AssistantMessage
        content={content}
        timestamp={timestamp}
        isLoading={isLoading}
        fragment={fragment}
        type={type}
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

const fragmentCardStyles = {
  container: {
    marginTop: "12px",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#fff",
    textDecoration: "none",
    outline: "none",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  icon: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconText: {
    fontSize: "12px",
  },
  info: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2px",
  },
  title: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#fff",
  },
  arrow: {
    fontSize: "12px",
    color: "#bdbdbd",
    marginLeft: "8px",
  },
};

export default AiChatMessageCard;
