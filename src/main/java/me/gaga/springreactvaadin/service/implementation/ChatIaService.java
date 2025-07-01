package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import me.gaga.springreactvaadin.DTO.ChatMessageDTO;
import me.gaga.springreactvaadin.DTO.ChatSessionDTO;
import me.gaga.springreactvaadin.entities.ChatMessage;
import me.gaga.springreactvaadin.entities.ChatSession;
import me.gaga.springreactvaadin.entities.MessageRole;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Flux;

import java.util.List;

@BrowserCallable
@AnonymousAllowed
public class ChatIaService {
    private final ChatClient chatClient;



    @Autowired
    private ChatHistoryService chatHistoryService;

    public ChatIaService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public Flux<String> sendMessage(String prompt) {
        return chatClient.prompt()
                .user(prompt)
                .stream()
                .content();
    }

    // New methods for chat history
    public List<ChatSessionDTO> getChatSessions(String userId) {
        return chatHistoryService.getAllChatSessions(userId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<ChatSessionDTO> searchChatSessions(String userId, String searchTerm) {
        return chatHistoryService.searchChatSessions(userId, searchTerm)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public ChatSessionDTO createNewChatSession(String firstMessage, String userId) {
        ChatSession session = chatHistoryService.createChatSession(firstMessage, userId);
        return convertToDTO(session);
    }

    public List<ChatMessageDTO> getChatMessages(Long sessionId, String userId) {
        return chatHistoryService.getChatMessages(sessionId, userId)
                .stream()
                .map(this::convertMessageToDTO)
                .toList();
    }

    public void addMessageToChat(Long sessionId, String content, String role, String userId) {
        MessageRole messageRole = "user".equals(role) ? MessageRole.USER : MessageRole.ASSISTANT;
        chatHistoryService.addMessageToSession(sessionId, content, messageRole, userId);
    }

    public boolean deleteChatSession(Long sessionId, String userId) {
        return chatHistoryService.deleteChatSession(sessionId, userId);
    }

    private ChatSessionDTO convertToDTO(ChatSession session) {
        return new ChatSessionDTO(
                session.getId().toString(),
                session.getTitle(),
                session.getLastMessage(),
                session.getTimestamp(),
                session.getMessageCount()
        );
    }

    private ChatMessageDTO convertMessageToDTO(ChatMessage message) {
        return new ChatMessageDTO(
                message.getId().toString(),
                message.getContent(),
                message.getRole().name().toLowerCase(),
                message.getTimestamp()
        );
    }

    public Flux<String> sendMessageWithSystemPrompt(String userMessage, String systemPrompt) {

            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(userMessage)
                    .stream()
                    .content();

    }
}