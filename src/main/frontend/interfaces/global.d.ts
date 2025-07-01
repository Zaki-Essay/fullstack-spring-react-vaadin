export {};

declare global {
    interface Window {
        chatHistoryMethods: {
            addNewChatSession: (firstMessage: string) => Promise<string | null>;
            updateChatSession: (chatId: string, lastMessage: string) => void;
            refreshSessions: () => void;
        };
    }
}