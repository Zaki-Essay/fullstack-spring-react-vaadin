import React, {useEffect, useState} from "react";
import {ChatIaService} from "Frontend/generated/endpoints";
import {Calendar,History, MessageSquare, Plus, Search, Trash2} from "lucide-react";
import "./style.css";
import {BackendChatSession, ChatSession} from "Frontend/types/index";



interface ChatHistoryProps {
    isCollapsed: boolean;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    currentChatId?: string;
}


export const ChatHistory: React.FC<ChatHistoryProps> = ({
                                                            isCollapsed,
                                                            onSelectChat,
                                                            onNewChat,
                                                            currentChatId
                                                        }) => {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);


    // Get current user ID (you'll need to implement this based on your auth system)
    const getCurrentUserId = () => {
        // Replace this with your actual user ID retrieval logic
        return 'current-user-id'; // This should come from your authentication system
    };

    // Helper function to safely convert backend data to ChatSession
    const convertToChatSession = (backendSession: BackendChatSession): ChatSession | null => {
        // Validate required fields
        if (!backendSession.id || !backendSession.title || !backendSession.lastMessage) {
            console.warn('Invalid chat session data:', backendSession);
            return null;
        }

        return {
            id: backendSession.id,
            title: backendSession.title,
            lastMessage: backendSession.lastMessage,
            timestamp: backendSession.timestamp ? new Date(backendSession.timestamp) : new Date(),
            messageCount: backendSession.messageCount ?? 0
        };
    };

    // Load chat sessions from backend
    const loadChatSessions = async () => {
        setLoading(true);
        try {
            const userId = getCurrentUserId();
            const sessions = await ChatIaService.getChatSessions(userId);

            // Convert and filter valid sessions
            const validSessions = sessions
                .map(convertToChatSession)
                .filter((session): session is ChatSession => session !== null);

            setChatSessions(validSessions);
        } catch (error) {
            console.error('Error loading chat sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search chat sessions
    const searchChatSessions = async (searchTerm: string) => {
        setLoading(true);
        try {
            const userId = getCurrentUserId();
            const sessions = await ChatIaService.searchChatSessions(userId, searchTerm);

            // Convert and filter valid sessions
            const validSessions = sessions
                .map(convertToChatSession)
                .filter((session): session is ChatSession => session !== null);

            setChatSessions(validSessions);
        } catch (error) {
            console.error('Error searching chat sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load sessions on component mount
    useEffect(() => {
        loadChatSessions();
    }, []);

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                searchChatSessions(searchTerm);
            } else {
                loadChatSessions();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const formatTimestamp = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            return `${days}d ago`;
        }
    };

    const deleteChat = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const userId = getCurrentUserId();
            const success = await ChatIaService.deleteChatSession(parseInt(chatId), userId);
            if (success) {
                setChatSessions(prev => prev.filter(session => session.id !== chatId));
            }
        } catch (error) {
            console.error('Error deleting chat session:', error);
        }
    };

    const toggleExpanded = () => {
        if (!isCollapsed) {
            setIsExpanded(!isExpanded);
        }
    };

    // Expose method to add new chat session
    const addNewChatSession = async (firstMessage: string): Promise<string | null> => {
        try {
            const userId = getCurrentUserId();
            const newSession = await ChatIaService.createNewChatSession(firstMessage, userId);

            const convertedSession = convertToChatSession(newSession);
            if (convertedSession) {
                setChatSessions(prev => [convertedSession, ...prev]);
                return convertedSession.id;
            }
            return null;
        } catch (error) {
            console.error('Error creating new chat session:', error);
            return null;
        }
    };

    // Expose method to update chat session
    const updateChatSession = (chatId: string, lastMessage: string) => {
        setChatSessions(prev => prev.map(session =>
            session.id === chatId
                ? {
                    ...session,
                    lastMessage,
                    timestamp: new Date(),
                    messageCount: session.messageCount + 1
                }
                : session
        ));
    };

    // Expose methods to parent component
    useEffect(() => {
        // You can use refs or context to expose these methods to parent components
        (window as any).chatHistoryMethods = {
            addNewChatSession,
            updateChatSession,
            refreshSessions: loadChatSessions
        };
    }, []);

    return (
        <div className="chat-history-section">
            {/* Header */}
            <div className="chat-history-header" onClick={toggleExpanded}>
                <div className="chat-history-title">
                    <History size={20} />
                    {!isCollapsed && <span>Chat History</span>}
                </div>
                {!isCollapsed && (
                    <button
                        className="new-chat-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNewChat();
                        }}
                        title="New Chat"
                    >
                        <Plus size={14} />
                    </button>
                )}
            </div>

            {/* Search */}
            {!isCollapsed && (isExpanded || chatSessions.length > 0) && (
                <div className="chat-search">
                    <div className="search-input-wrapper">
                        <Search size={14} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            )}

            {/* Chat List */}
            {!isCollapsed && (isExpanded || chatSessions.length > 0) && (
                <div className="chat-list">
                    {loading ? (
                        <div className="loading-sessions">Loading...</div>
                    ) : chatSessions.length === 0 ? (
                        <div className="no-chats">
                            {searchTerm ? 'No matching chats found' : 'No chat history yet'}
                        </div>
                    ) : (
                        chatSessions.map((session) => (
                            <div
                                key={session.id}
                                className={`chat-item ${session.id === currentChatId ? 'active' : ''}`}
                                onClick={() => onSelectChat(session.id)}
                            >
                                <div className="chat-item-icon">
                                    <MessageSquare size={14} />
                                </div>
                                <div className="chat-item-content">
                                    <div className="chat-item-title">{session.title}</div>
                                    <div className="chat-item-preview">{session.lastMessage}</div>
                                    <div className="chat-item-meta">
                                        <span className="chat-timestamp">
                                            <Calendar size={10} />
                                            {formatTimestamp(session.timestamp)}
                                        </span>
                                        <span className="message-count">{session.messageCount} msgs</span>
                                    </div>
                                </div>
                                <button
                                    className="delete-chat-btn"
                                    onClick={(e) => deleteChat(session.id, e)}
                                    title="Delete chat"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Collapsed state indicator */}
            {isCollapsed && chatSessions.length > 0 && (
                <div className="chat-count-indicator">
                    {chatSessions.length}
                </div>
            )}
        </div>
    );
};