import {BackendMessage, Message} from "Frontend/types";

export const convertToMessage = (backendMessage: BackendMessage): Message | null => {
    if (!backendMessage.id || !backendMessage.content || !backendMessage.role) {
        console.warn('Invalid message data:', backendMessage);
        return null;
    }

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

export const createUserMessage = (content: string): Message => ({
    id: Date.now().toString(),
    content: content.trim(),
    role: 'user',
    timestamp: new Date()
});

export const createAssistantMessage = (id: string): Message => ({
    id,
    content: '',
    role: 'assistant',
    timestamp: new Date()
});