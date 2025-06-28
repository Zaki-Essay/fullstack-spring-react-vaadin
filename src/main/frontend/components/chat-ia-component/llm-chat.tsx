import {useEffect, useRef, useState} from "react";
import { Send, Bot, User, Loader2, Trash2, Copy, Check } from 'lucide-react';
import "./style.css";
import {ChatIaService} from "Frontend/generated/endpoints";

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}



export default function LLMChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

/*    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);*/

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            role: 'user',
            timestamp: new Date()
        };

        // Add user message to messages array
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const assistantMessageId = (Date.now() + 1).toString();
        const assistantTimestamp = new Date();

        // Add empty assistant message
        setMessages(prev => [...prev, {
            id: assistantMessageId,
            content: '',
            role: 'assistant',
            timestamp: assistantTimestamp
        }]);

        // Handle streaming response
        ChatIaService.sendMessage(userMessage.content).onNext(chunk => {
            setIsLoading(false);
            setMessages(prevMessages => {
                return prevMessages.map(msg =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + chunk }
                        : msg
                );
            });
        });

        // Set loading to false after a delay (in real implementation, this should be handled by the service)

    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setInputValue('');
        setIsLoading(false);
    };

    const handleCopyMessage = async (messageId: string, content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (err) {
            console.error('Failed to copy message:', err);
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1 className="chat-title">
                    <Bot size={24} />
                    LLM Chat Interface
                </h1>
                <div className="chat-actions">
                    <button
                        className="action-button"
                        onClick={handleClearChat}
                        title="Clear chat"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </header>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Bot size={64} />
                        </div>
                        <p className="empty-state-text">Start a conversation with the AI assistant</p>
                        <p className="empty-state-subtext">Type your message below to begin</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={`message ${message.role}`}>
                            <div className={`message-avatar ${message.role}`}>
                                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className="message-content">
                                <p className="message-text">{message.content}</p>
                                <div className="message-actions">
                                    <button
                                        className="copy-button"
                                        onClick={() => handleCopyMessage(message.id, message.content)}
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
                    ))
                )}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-avatar assistant">
                            <Bot size={20} />
                        </div>
                        <div className="typing-indicator">
                            <Loader2 size={16} className="animate-spin" />
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

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
                    <button
                        className="send-button"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        title="Send message"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}