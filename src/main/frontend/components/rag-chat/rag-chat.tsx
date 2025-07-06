import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Bot,
    User,
    Loader2,
    Trash2,
    Copy,
    Check,
    Square,
    Upload,
    FileText,
    X,
    Search,
    Database,
    RefreshCw,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import "./style.css";
import {FileUploadService} from "Frontend/generated/endpoints";
import DocumentResponseDTO from "Frontend/generated/me/gaga/springreactvaadin/DTO/DocumentResponseDTO";

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    status: string; //'processing' | 'ready' | 'error'
    chunks?: number;
}

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    sources?: string[];
}

interface RAGStats {
    totalDocuments: number;
    totalChunks: number;
    indexSize: string;
    lastUpdated: Date;
}

export default function RagChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'knowledge'>('chat');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [ragStats, setRagStats] = useState<RAGStats>({
        totalDocuments: 2,
        totalChunks: 245,
        indexSize: '15.2 MB',
        lastUpdated: new Date('2024-01-15T10:30:00')
    });
    const [dragOver, setDragOver] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    const buildDocumentFromDocumentResponse = (documentResponse: DocumentResponseDTO): Document => {
        return {
            id: documentResponse.id!,
            name: documentResponse.name!,
            type: documentResponse.type!,
            size: documentResponse.size!,
            uploadDate: new Date(documentResponse.uploadDate!),
            status: documentResponse.status!,
            chunks: documentResponse.chunks
        };
    };

    useEffect(() => {
        scrollToBottom();
        FileUploadService.getAllDocuments().then((response) => {
            const documents = response.map(buildDocumentFromDocumentResponse);
            setDocuments(documents);
        });
    }, [messages, documents]);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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

        // Simulate RAG response with sources
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `Based on the documents in your knowledge base, here's what I found:\n\n${messageContent.includes('company') ? 'According to the company handbook, our organization follows a structured approach to employee development and performance management.' : 'The information you\'re looking for relates to several key concepts covered in the uploaded documents.'}\n\nThis response is generated using Retrieval-Augmented Generation (RAG) technology, which searches through your uploaded documents to provide contextually relevant answers.`,
                role: 'assistant',
                timestamp: new Date(),
                sources: messageContent.includes('company') ? ['company-handbook.pdf', 'product-specs.docx'] : ['research-paper.pdf']
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
            setIsStreaming(false);
        }, 2000);
    };

    const handleStopGeneration = () => {
        setIsLoading(false);
        setIsStreaming(false);
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

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach(file => {

            FileUploadService.uploadFile(file).then(response => {
                const document = buildDocumentFromDocumentResponse(response.document!);
                setDocuments(prev => [...prev, document]);
            });
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDeleteDocument = (docId: string) => {
        FileUploadService.deleteDocument(docId).then(() => {
            setDocuments(prev => prev.filter(doc => doc.id !== docId));
        });
    };

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderChatTab = () => (
        <div className="chat-messages">
            {messages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Database size={64} />
                    </div>
                    <p className="empty-state-text">Ask questions about your documents</p>
                    <p className="empty-state-subtext">Upload documents and start asking questions to get AI-powered answers</p>
                </div>
            ) : (
                messages.map((message) => (
                    <div key={message.id} className={`message ${message.role}`}>
                        <div className={`message-avatar ${message.role}`}>
                            {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        <div className="message-content">
                            <div className="message-text">
                                {message.content}
                            </div>
                            {message.sources && (
                                <div className="message-sources">
                                    <p className="sources-label">Sources:</p>
                                    <div className="sources-list">
                                        {message.sources.map((source, index) => (
                                            <span key={index} className="source-tag">
                        <FileText size={12} />
                                                {source}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                        {isStreaming ? 'Searching documents...' : 'Thinking...'}
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );

    const renderDocumentsTab = () => (
        <div className="documents-container">
            <div className="documents-header">
                <div className="search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button
                    className="upload-button"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={18} />
                    Upload Documents
                </button>
            </div>

            <div
                className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload size={48} />
                <p>Drag and drop files here or click to upload</p>
                <p className="upload-hint">Supported formats: PDF, DOCX, TXT, MD</p>
            </div>

            <div className="documents-list">
                {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="document-item">
                        <div className="document-icon">
                            <FileText size={24} />
                        </div>
                        <div className="document-info">
                            <h3 className="document-name">{doc.name}</h3>
                            <div className="document-meta">
                                <span className="document-type">{doc.type}</span>
                                <span className="document-size">{formatFileSize(doc.size)}</span>
                                <span className="document-date">
                  {doc.uploadDate.toLocaleDateString()}
                </span>
                            </div>
                            {doc.status === 'ready' && (
                                <div className="document-chunks">
                                    {doc.chunks} chunks processed
                                </div>
                            )}
                        </div>
                        <div className="document-status">
                            {doc.status === 'processing' && (
                                <div className="status-processing">
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </div>
                            )}
                            {doc.status === 'ready' && (
                                <div className="status-ready">
                                    <CheckCircle size={16} />
                                    Ready
                                </div>
                            )}
                            {doc.status === 'error' && (
                                <div className="status-error">
                                    <AlertCircle size={16} />
                                    Error
                                </div>
                            )}
                        </div>
                        <button
                            className="delete-button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            title="Delete document"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => handleFileUpload(e.target.files)}
                style={{ display: 'none' }}
            />
        </div>
    );

    const renderKnowledgeTab = () => (
        <div className="knowledge-container">
            <div className="knowledge-header">
                <h2>Knowledge Base Statistics</h2>
                <button className="refresh-button" title="Refresh statistics">
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FileText size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Documents</h3>
                        <p className="stat-value">{ragStats.totalDocuments}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Database size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Chunks</h3>
                        <p className="stat-value">{ragStats.totalChunks}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Search size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Index Size</h3>
                        <p className="stat-value">{ragStats.indexSize}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <RefreshCw size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Last Updated</h3>
                        <p className="stat-value">{ragStats.lastUpdated.toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="knowledge-settings">
                <h3>RAG Configuration</h3>
                <div className="setting-item">
                    <label>Chunk Size</label>
                    <select className="setting-select">
                        <option value="512">512 tokens</option>
                        <option value="1024" selected>1024 tokens</option>
                        <option value="2048">2048 tokens</option>
                    </select>
                </div>
                <div className="setting-item">
                    <label>Chunk Overlap</label>
                    <select className="setting-select">
                        <option value="50">50 tokens</option>
                        <option value="100" selected>100 tokens</option>
                        <option value="200">200 tokens</option>
                    </select>
                </div>
                <div className="setting-item">
                    <label>Similarity Threshold</label>
                    <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="setting-slider" />
                    <span className="slider-value">0.7</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="rag-container">
            <header className="rag-header">
                <h1 className="rag-title">
                    <Database size={24} />
                    RAG Assistant
                </h1>
                <div className="rag-actions">
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

            <div className="rag-tabs">
                <button
                    className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    <Bot size={18} />
                    Chat
                </button>
                <button
                    className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    <FileText size={18} />
                    Documents
                </button>
                <button
                    className={`tab-button ${activeTab === 'knowledge' ? 'active' : ''}`}
                    onClick={() => setActiveTab('knowledge')}
                >
                    <Database size={18} />
                    Knowledge Base
                </button>
            </div>

            <div className="rag-content">
                {activeTab === 'chat' && renderChatTab()}
                {activeTab === 'documents' && renderDocumentsTab()}
                {activeTab === 'knowledge' && renderKnowledgeTab()}
            </div>

            {activeTab === 'chat' && (
                <div className="rag-input-container">
                    <div className="rag-input-wrapper">
            <textarea
                ref={inputRef}
                className="rag-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask questions about your documents... (Enter to send, Shift+Enter for new line)"
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
            )}
        </div>
    );
}