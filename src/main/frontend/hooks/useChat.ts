import {useState} from "react";
import {Message} from "Frontend/types";

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    return {
        messages,
        setMessages,
        inputValue,
        setInputValue,
        isLoading,
        setIsLoading,
        isStreaming,
        setIsStreaming,
        currentChatId,
        setCurrentChatId,
        copiedMessageId,
        setCopiedMessageId,
    };
};