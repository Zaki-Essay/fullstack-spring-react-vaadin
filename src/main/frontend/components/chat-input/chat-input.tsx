import React, {useRef} from "react";
import {Loader2, Send, Square} from "lucide-react";
import "./style.css";

export const ChatInput: React.FC<{
    inputValue: string;
    setInputValue: (value: string) => void;
    isLoading: boolean;
    isStreaming: boolean;
    onSendMessage: () => void;
    onStopGeneration: () => void;
}> = ({ inputValue, setInputValue, isLoading, isStreaming, onSendMessage, onStopGeneration }) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className="chat-input-container">
            <div className="chat-input-wrapper">
        <textarea
            ref={inputRef}
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
        />
                {isStreaming ? (
                    <button
                        className="stop-button-input"
                        onClick={onStopGeneration}
                        title="Stop generation"
                    >
                        <Square size={20} />
                    </button>
                ) : (
                    <button
                        className="send-button"
                        onClick={onSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        title="Send message"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};