import {Message} from "Frontend/types";
import {Bot, Check, Copy, User} from "lucide-react";
import MarkdownRenderer from "Frontend/components/markdown-message/markdown-message";
import React from "react";
import "./style.css";

export const MessageItem: React.FC<{
  message: Message;
  copiedMessageId: string | null;
  onCopyMessage: (messageId: string, content: string) => void;
}> = ({ message, copiedMessageId, onCopyMessage }) => {
  if (!message.content) return null;

  return (
    <div className={`message ${message.role}`}>
      <div className={`message-avatar ${message.role}`}>
        {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
      </div>
      <div className="message-content">
        <div className="message-text">
          <MarkdownRenderer content={message.content} />
        </div>
        <div className="message-actions">
          <button
            className="copy-button"
            onClick={() => onCopyMessage(message.id, message.content)}
            title="Copy message"
          >
            {copiedMessageId === message.id ? (
              <Check size={16} />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};