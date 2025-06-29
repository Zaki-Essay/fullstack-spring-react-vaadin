import React, { useState, useEffect } from 'react';
import { History, MessageSquare, Trash2, Plus, Search, Calendar } from 'lucide-react';
import './style.css';

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
}

interface ChatHistoryProps {
    isCollapsed: boolean;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    currentChatId?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
                                                     isCollapsed,
                                                     onSelectChat,
                                                     onNewChat,
                                                     currentChatId
                                                 }) => {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Load chat sessions from memory (in a real app, this would be from a database)
    useEffect(() => {
        // Mock data for demo - in real app, load from your backend
        const mockSessions: ChatSession[] = [
            {
                id: '1',
                title: 'React Best Practices',
                lastMessage: 'Thanks for the explanation about hooks!',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                messageCount: 12
            },
            {
                id: '2',
                title: 'TypeScript Questions',
                lastMessage: 'How do I define interface for...',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                messageCount: 8
            },
            {
                id: '3',
                title: 'CSS Flexbox Layout',
                lastMessage: 'Perfect! That solved my layout issue.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                messageCount: 15
            },
            {
                id: '4',
                title: 'Database Design Help',
                lastMessage: 'What about indexing strategies?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
                messageCount: 23
            },

        ];
        setChatSessions(mockSessions);
    }, []);

    const filteredSessions = chatSessions.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const deleteChat = (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setChatSessions(prev => prev.filter(session => session.id !== chatId));
    };

    const toggleExpanded = () => {
        if (!isCollapsed) {
            setIsExpanded(!isExpanded);
        }
    };

    const generateChatTitle = (message: string) => {
        // Simple title generation from first message
        return message.length > 30 ? message.substring(0, 30) + '...' : message;
    };

    // Function to be called when a new chat is created
    const addNewChatSession = (firstMessage: string) => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: generateChatTitle(firstMessage),
            lastMessage: firstMessage,
            timestamp: new Date(),
            messageCount: 1
        };
        setChatSessions(prev => [newSession, ...prev]);
        return newSession.id;
    };

    // Function to update existing chat session
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

    return (
        <div className="chat-history-section">
            {/* Header */}
            <div className="chat-history-header" onClick={toggleExpanded}>
                <div className="chat-history-title">
                    <History size={16} className="chat-history-icon" />
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

            {/* Search - only show when expanded and not collapsed */}
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
                    {filteredSessions.length === 0 ? (
                        <div className="no-chats">
                            {searchTerm ? 'No matching chats found' : 'No chat history yet'}
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
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

export default ChatHistory;