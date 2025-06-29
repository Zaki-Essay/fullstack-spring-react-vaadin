import React, {useEffect, useRef, useState} from "react";
import {Send, Bot, User, Loader2, Trash2, Copy, Check, Square} from 'lucide-react';
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
    const [isStreaming, setIsStreaming] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const streamSubscriptionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        setIsStreaming(true);

        const assistantMessageId = (Date.now() + 1).toString();
        const assistantTimestamp = new Date();

        // Add empty assistant message
        setMessages(prev => [...prev, {
            id: assistantMessageId,
            content: '',
            role: 'assistant',
            timestamp: assistantTimestamp
        }]);

        try {
            // Handle streaming response with your service
            const subscription = ChatIaService.sendMessage(userMessage.content);
            streamSubscriptionRef.current = subscription;

            subscription.onNext(chunk => {
                // Check if the component is still streaming (not stopped)
                if (!streamSubscriptionRef.current) {
                    return;
                }

                setIsLoading(false);
                setMessages(prevMessages => {
                    return prevMessages.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    );
                });
            });

            // Handle completion
            subscription.onComplete(() => {
                setIsLoading(false);
                setIsStreaming(false);
                streamSubscriptionRef.current = null;
            });

            // Handle errors
            subscription.onError(() => {
                console.error('Streaming error:');
                setIsLoading(false);
                setIsStreaming(false);
                streamSubscriptionRef.current = null;

                // Optionally add an error message
                setMessages(prevMessages => {
                    return prevMessages.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: msg.content + '\n\n[Error: Failed to complete response]' }
                            : msg
                    );
                });
            });

        } catch (error) {
            console.error('Error starting stream:', error);
            setIsLoading(false);
            setIsStreaming(false);
            streamSubscriptionRef.current = null;

            // Add error message to the assistant message
            setMessages(prevMessages => {
                return prevMessages.map(msg =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: '[Error: Failed to send message]' }
                        : msg
                );
            });
        }
    };

    const handleStopGeneration = () => {
        if (streamSubscriptionRef.current) {
            // Cancel the subscription if your service supports it
            if (typeof streamSubscriptionRef.current.cancel === 'function') {
                streamSubscriptionRef.current.cancel();
            } else if (typeof streamSubscriptionRef.current.unsubscribe === 'function') {
                streamSubscriptionRef.current.unsubscribe();
            } else if (typeof streamSubscriptionRef.current.abort === 'function') {
                streamSubscriptionRef.current.abort();
            }

            streamSubscriptionRef.current = null;
            setIsLoading(false);
            setIsStreaming(false);

            console.log('Generation stopped by user');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        // Stop any ongoing generation first
        if (streamSubscriptionRef.current) {
            handleStopGeneration();
        }

        setMessages([]);
        setInputValue('');
        setIsLoading(false);
        setIsStreaming(false);
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

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (streamSubscriptionRef.current) {
                handleStopGeneration();
            }
        };
    }, []);

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1 className="chat-title">
                    <Bot size={24} />
                    LLM Chat Interface
                </h1>
                <div className="chat-actions">
                    {isStreaming && (
                        <button
                            className="action-button stop-button"
                            onClick={handleStopGeneration}
                            title="Stop generation"
                        >
                            <Square size={18} />
                        </button>
                    )}
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
                        message.content !== '' && (
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
                        )
                    ))
                )}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-avatar assistant">
                            <Bot size={20} />
                        </div>
                        <div className="typing-indicator">
                            <Loader2 size={16} className="animate-spin" />
                            {isStreaming ? 'Generating...' : 'Thinking...'}
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
                    {isStreaming ? (
                        <button
                            className="stop-button-input"
                            onClick={handleStopGeneration}
                            title="Stop generation"
                        >
                            <Square size={20} />
                        </button>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}