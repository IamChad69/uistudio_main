import React from "react";
import { AiChatContainer } from "./AiChat/index";

interface AiChatProps {
  open: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onCodeContextScraping?: () => void;
}

const AiChat: React.FC<AiChatProps> = ({
  open,
  onClose,
  position,
  onCodeContextScraping,
}) => {
  return (
    <AiChatContainer
      open={open}
      onClose={onClose}
      position={position}
      onCodeContextScraping={onCodeContextScraping}
    />
  );
};

export default AiChat;
