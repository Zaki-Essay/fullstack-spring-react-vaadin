import {Bot, Loader2} from "lucide-react";
import React from "react";
import "./style.css";

export const TypingIndicator: React.FC<{ isStreaming: boolean }> = ({ isStreaming }) => (
    <div className="message assistant">
        <div className="message-avatar assistant">
            <Bot size={20} />
        </div>
        <div className="typing-indicator">
            <Loader2 size={16} className="animate-spin" />
            {isStreaming ? 'Generating...' : 'Thinking...'}
        </div>
    </div>
);