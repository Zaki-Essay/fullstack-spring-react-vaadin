import React, {useCallback, useEffect, useRef} from "react";
import "./style.css";
import {ChatIaService} from "Frontend/generated/endpoints";
import {Message} from "Frontend/types";
import {useAuth} from "Frontend/context/AuthContext";
import {useChat} from "Frontend/hooks/useChat";
import {useStreamSubscription} from "Frontend/hooks/useStreamSubscription";
import {convertToMessage, createAssistantMessage, createUserMessage} from "Frontend/utils/helpers";
import {ChatHeader} from "Frontend/components/chat-header/chat-header";
import {EmptyState} from "Frontend/components/empty-state/empty-state";
import {MessageItem} from "Frontend/components/message-item/message-item";
import {TypingIndicator} from "Frontend/components/typing-indicator/typing-indicator";
import {ChatInput} from "Frontend/components/chat-input/chat-input";

export function LlmChat() {
    const {
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
    } = useChat();

    const { streamSubscriptionRef, stopStream } = useStreamSubscription();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const user = useAuth();

    // Utility functions
    const getCurrentUserId = useCallback(() => {
        return user.user?.id! + "";
    }, [user.user?.id]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const refreshChatHistory = useCallback(() => {
        if ((window as any).chatHistoryMethods) {
            (window as any).chatHistoryMethods.refreshSessions();
        }
    }, []);

    const updateChatSession = useCallback((sessionId: string, response: string) => {
        if ((window as any).chatHistoryMethods) {
            (window as any).chatHistoryMethods.updateChatSession(sessionId, response);
        }
    }, []);

    // Chat operations
    const loadChatMessages = useCallback(async (sessionId: string) => {
        try {
            const userId = getCurrentUserId();
            const chatMessages = await ChatIaService.getChatMessages(parseInt(sessionId), userId);

            const validMessages = chatMessages
                .map(convertToMessage)
                .filter((message): message is Message => message !== null);

            setMessages(validMessages);
            setCurrentChatId(sessionId);
        } catch (error) {
            console.error('Error loading chat messages:', error);
        }
    }, [getCurrentUserId, setMessages, setCurrentChatId]);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setCurrentChatId(null);
        setInputValue('');
    }, [setMessages, setCurrentChatId, setInputValue]);

    const handleStopGeneration = useCallback(() => {
        stopStream();
        setIsLoading(false);
        setIsStreaming(false);
    }, [stopStream, setIsLoading, setIsStreaming]);

    const handleClearChat = useCallback(() => {
        if (streamSubscriptionRef.current) {
            handleStopGeneration();
        }
        handleNewChat();
    }, [streamSubscriptionRef, handleStopGeneration, handleNewChat]);

    const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (err) {
            console.error('Failed to copy message:', err);
        }
    }, [setCopiedMessageId]);

    const handleSendMessage = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = createUserMessage(inputValue);
        setMessages(prev => [...prev, userMessage]);

        const messageContent = inputValue.trim();
        setInputValue('');
        setIsLoading(true);
        setIsStreaming(true);

        try {
            const userId = getCurrentUserId();
            let sessionId = currentChatId;

            // Create new session if needed
            if (!sessionId) {
                const newSession = await ChatIaService.createNewChatSession(messageContent, userId);
                if (newSession?.id) {
                    sessionId = newSession.id;
                    setCurrentChatId(sessionId);
                    refreshChatHistory();
                } else {
                    throw new Error('Failed to create new chat session');
                }
            } else {
                await ChatIaService.addMessageToChat(parseInt(sessionId), messageContent, 'user', userId);
            }

            // Create assistant message placeholder
            const assistantMessageId = (Date.now() + 1).toString();
            const assistantMessage = createAssistantMessage(assistantMessageId);
            setMessages(prev => [...prev, assistantMessage]);

            // Start streaming
            const subscription = ChatIaService.sendMessage(messageContent);
            streamSubscriptionRef.current = subscription;
            let fullAssistantResponse = '';

            subscription.onNext(chunk => {
                if (!streamSubscriptionRef.current) return;
                fullAssistantResponse += chunk;
                setIsLoading(false);

                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    )
                );
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
                        updateChatSession(sessionId, fullAssistantResponse);
                    } catch (error) {
                        console.error('Error saving assistant message:', error);
                    }
                }
            });

            subscription.onError(() => {
                setIsLoading(false);
                setIsStreaming(false);
                streamSubscriptionRef.current = null;

                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: msg.content + '\n\n[Error: Failed to complete response]' }
                            : msg
                    )
                );
            });

        } catch (error) {
            console.error('Error starting stream:', error);
            setIsLoading(false);
            setIsStreaming(false);
            streamSubscriptionRef.current = null;
            setMessages(prev => prev.slice(0, -1));
        }
    }, [
        inputValue,
        isLoading,
        setMessages,
        setInputValue,
        setIsLoading,
        setIsStreaming,
        getCurrentUserId,
        currentChatId,
        setCurrentChatId,
        refreshChatHistory,
        streamSubscriptionRef,
        updateChatSession,
    ]);

    // Effects
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        getCurrentUserId();
    }, [getCurrentUserId]);

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
    }, [loadChatMessages, handleNewChat]);

    useEffect(() => {
        return () => {
            if (streamSubscriptionRef.current) {
                handleStopGeneration();
            }
        };
    }, [handleStopGeneration, streamSubscriptionRef]);

    return (
        <div className="chat-container">
            <ChatHeader
                isStreaming={isStreaming}
                onStopGeneration={handleStopGeneration}
                onClearChat={handleClearChat}
            />

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            copiedMessageId={copiedMessageId}
                            onCopyMessage={handleCopyMessage}
                        />
                    ))
                )}
                {isLoading && <TypingIndicator isStreaming={isStreaming} />}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                isLoading={isLoading}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onStopGeneration={handleStopGeneration}
            />
        </div>
    );
}