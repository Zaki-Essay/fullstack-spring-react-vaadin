export interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
}

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    sources?: string[];
}

export interface BackendChatSession {
    id?: string;
    title?: string;
    lastMessage?: string;
    timestamp?: string; // Backend likely returns string timestamps
    messageCount?: number;
}

export interface BackendMessage {
    id?: string;
    content?: string;
    role?: string;
    timestamp?: string; // Backend likely returns string timestamps
}

export interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    status: DocumentStatus;
    chunks?: number;
}
export enum DocumentStatus {
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export interface RAGStats {
    totalDocuments: number;
    totalChunks: number;
    indexSize: string;
    lastUpdated: Date;
}