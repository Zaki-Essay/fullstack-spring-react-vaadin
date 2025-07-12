import React, {useEffect, useRef, useState} from "react";
import {Send, Bot, User, Loader2, Trash2, Copy, Check, Square} from 'lucide-react';
import "./style.css";
import {ChatIaService} from "Frontend/generated/endpoints";
import ReactMarkdown from 'react-markdown';
import MarkdownRenderer from "Frontend/components/markdown-message/markdown-message";

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
}

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

// Define the shape of data coming from the backend
interface BackendMessage {
    id?: string;
    content?: string;
    role?: string;
    timestamp?: string; // Backend likely returns string timestamps
}

interface BackendChatSession {
    id?: string;
    title?: string;
    lastMessage?: string;
    timestamp?: string;
    messageCount?: number;
}

export function LlmChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const streamSubscriptionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Get current user ID
    const getCurrentUserId = () => {
        return 'current-user-id'; // Replace with actual user ID
    };

    // Helper function to safely convert backend message data
    const convertToMessage = (backendMessage: BackendMessage): Message | null => {
        // Validate required fields
        if (!backendMessage.id || !backendMessage.content || !backendMessage.role) {
            console.warn('Invalid message data:', backendMessage);
            return null;
        }

        // Validate role
        if (backendMessage.role !== 'user' && backendMessage.role !== 'assistant') {
            console.warn('Invalid message role:', backendMessage.role);
            return null;
        }

        return {
            id: backendMessage.id,
            content: backendMessage.content,
            role: backendMessage.role as 'user' | 'assistant',
            timestamp: backendMessage.timestamp ? new Date(backendMessage.timestamp) : new Date()
        };
    };

    // Load messages for a specific chat session
    const loadChatMessages = async (sessionId: string) => {
        try {
            const userId = getCurrentUserId();
            const chatMessages = await ChatIaService.getChatMessages(parseInt(sessionId), userId);

            // Convert and filter valid messages
            const validMessages = chatMessages
                .map(convertToMessage)
                .filter((message): message is Message => message !== null);

            setMessages(validMessages);
            setCurrentChatId(sessionId);
        } catch (error) {
            console.error('Error loading chat messages:', error);
        }
    };

    // Handle new chat
    const handleNewChat = () => {
        setMessages([]);
        setCurrentChatId(null);
        setInputValue('');
    };

    // Listen for sidebar events
    useEffect(() => {
        const handleSelectChat = (event: CustomEvent) => {
            const { chatId } = event.detail;
            loadChatMessages(chatId);
        };

        const handleNewChatEvent = () => {
            handleNewChat();
        };

        window.addEventListener('selectChat', handleSelectChat as EventListener);
        window.addEventListener('newChat', handleNewChatEvent);

        return () => {
            window.removeEventListener('selectChat', handleSelectChat as EventListener);
            window.removeEventListener('newChat', handleNewChatEvent);
        };
    }, []);

    // Handle sending messages
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const messageContent = inputValue.trim();
        setInputValue('');
        setIsLoading(true);
        setIsStreaming(true);

        try {
            const userId = getCurrentUserId();
            let sessionId = currentChatId;

            if (!sessionId) {
                const newSession = await ChatIaService.createNewChatSession(messageContent, userId);
                // Safely extract session ID
                if (newSession && newSession.id) {
                    sessionId = newSession.id;
                    setCurrentChatId(sessionId);
                    if ((window as any).chatHistoryMethods) {
                        (window as any).chatHistoryMethods.refreshSessions();
                    }
                } else {
                    throw new Error('Failed to create new chat session');
                }
            } else {
                await ChatIaService.addMessageToChat(parseInt(sessionId), messageContent, 'user', userId);
            }

            const assistantMessageId = (Date.now() + 1).toString();
            const assistantTimestamp = new Date();

            setMessages(prev => [...prev, {
                id: assistantMessageId,
                content: '',
                role: 'assistant',
                timestamp: assistantTimestamp
            }]);

            const subscription = ChatIaService.sendMessage(messageContent);
            streamSubscriptionRef.current = subscription;

            let fullAssistantResponse = '';

            subscription.onNext(chunk => {
                if (!streamSubscriptionRef.current) return;

                fullAssistantResponse += chunk;
                setIsLoading(false);
                setMessages(prevMessages => {
                    return prevMessages.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    );
                });
            });

            subscription.onComplete(async () => {
                setIsLoading(false);
                setIsStreaming(false);
                streamSubscriptionRef.current = null;

                if (sessionId && fullAssistantResponse) {
                    try {
                        await ChatIaService.addMessageToChat(
                            parseInt(sessionId),
                            fullAssistantResponse,
                            'assistant',
                            userId
                        );

                        if ((window as any).chatHistoryMethods) {
                            (window as any).chatHistoryMethods.updateChatSession(sessionId, fullAssistantResponse);
                        }
                    } catch (error) {
                        console.error('Error saving assistant message:', error);
                    }
                }
            });

            subscription.onError(() => {
                setIsLoading(false);
                setIsStreaming(false);
                streamSubscriptionRef.current = null;

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

            // Remove the user message if we failed to process it
            setMessages(prev => prev.slice(0, -1));
        }
    };

    const handleStopGeneration = () => {
        if (streamSubscriptionRef.current) {
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
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        if (streamSubscriptionRef.current) {
            handleStopGeneration();
        }
        handleNewChat();
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
                                    <p className="message-text">
                                        <div className="message-text">
                                            <MarkdownRenderer content={message.content} />
                                        </div>
                                    </p>
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