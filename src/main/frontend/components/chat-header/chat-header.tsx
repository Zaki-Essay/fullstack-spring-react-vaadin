import {Bot, Square, Trash2} from "lucide-react";
import React from "react";
import "./style.css";

export const ChatHeader: React.FC<{
    isStreaming: boolean;
    onStopGeneration: () => void;
    onClearChat: () => void;
}> = ({ isStreaming, onStopGeneration, onClearChat }) => (
    <header className="chat-header">
        <h1 className="chat-title">
            <Bot size={24} />
            LLM Chat Interface
        </h1>
        <div className="chat-actions">
            {isStreaming && (
                <button
                    className="action-button stop-button"
                    onClick={onStopGeneration}
                    title="Stop generation"
                >
                    <Square size={18} />
                </button>
            )}
            <button
                className="action-button"
                onClick={onClearChat}
                title="Clear chat"
            >
                <Trash2 size={18} />
            </button>
        </div>
    </header>
);