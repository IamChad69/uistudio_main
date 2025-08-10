import React, { useState } from "react";
import { ArrowUpIcon, Loader2 } from "lucide-react";

interface AiChatMessageFormProps {
  onSubmit: (message: string) => void;
  isPending?: boolean;
  disabled?: boolean;
  hasContext?: boolean;
}

const AiChatMessageForm: React.FC<AiChatMessageFormProps> = ({
  onSubmit,
  isPending = false,
  disabled = false,
  hasContext = false,
}) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isPending || disabled) return;

    onSubmit(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isButtonDisabled = isPending || disabled || !message.trim();

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div
        style={{
          ...styles.inputContainer,
          ...(isFocused && styles.inputContainerFocused),
        }}
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Dont reinvent the wheel, ask me to remix or modify this component..."
          style={styles.textarea}
          rows={3}
          disabled={isPending || disabled}
        />
        <div style={styles.footer}>
          <div style={styles.shortcutHint}>
            {hasContext && (
              <span style={styles.contextIndicator}>🎯 Context Added</span>
            )}
            <kbd style={styles.kbd}>
              <span>⌘</span>
              Enter
            </kbd>
            &nbsp;to submit
          </div>

          <button
            type="submit"
            disabled={isButtonDisabled}
            style={{
              ...styles.submitButton,
              ...(isButtonDisabled && styles.submitButtonDisabled),
            }}
          >
            {isPending ? (
              <Loader2 size={16} style={styles.spinner} />
            ) : (
              <ArrowUpIcon size={16} />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

const styles = {
  form: {
    padding: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    pointerEvents: "none" as const,
  },
  inputContainer: {
    border: "1px solid #23272f",
    borderRadius: "8px",
    backgroundColor: "#1a1a1a",
    transition: "all 0.2s",
    padding: "12px",
    pointerEvents: "auto" as const,
  },
  inputContainerFocused: {
    border: "1px solid #4169e1",
    boxShadow: "0 0 0 2px rgba(65, 105, 225, 0.2)",
  },
  textarea: {
    width: "100%",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: "#fff",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "none" as const,
    fontFamily: "inherit",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  shortcutHint: {
    color: "#bdbdbd",
    fontSize: "11px",
    fontFamily: "monospace",
  },
  contextIndicator: {
    color: "#4169e1",
    fontSize: "11px",
    marginRight: "8px",
  },
  kbd: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    padding: "2px 6px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #23272f",
    borderRadius: "4px",
    fontSize: "10px",
    fontFamily: "monospace",
  },
  submitButton: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#4169e1",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  submitButtonDisabled: {
    backgroundColor: "#2a2a2a",
    border: "1px solid #23272f",
    cursor: "not-allowed",
  },
  spinner: {
    animation: "spin 1s linear infinite",
  },
};

export default AiChatMessageForm;