package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import jakarta.transaction.Transactional;
import me.gaga.springreactvaadin.entities.ChatMessage;
import me.gaga.springreactvaadin.entities.ChatSession;
import me.gaga.springreactvaadin.entities.MessageRole;
import me.gaga.springreactvaadin.repository.ChatMessageRepository;
import me.gaga.springreactvaadin.repository.ChatSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Transactional
@BrowserCallable
@AnonymousAllowed
public class ChatHistoryService {

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public List<ChatSession> getAllChatSessions(String userId) {
        return chatSessionRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<ChatSession> searchChatSessions(String userId, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllChatSessions(userId);
        }
        return chatSessionRepository.findByUserIdAndSearchTerm(userId, searchTerm);
    }

    public ChatSession createChatSession(String firstMessage, String userId) {
        String title = generateTitle(firstMessage);
        ChatSession session = new ChatSession(title, userId);
        session.setLastMessage(firstMessage);
        session.setMessageCount(1);

        ChatSession savedSession = chatSessionRepository.save(session);

        // Add the first message
        ChatMessage userMessage = new ChatMessage(firstMessage, MessageRole.USER, savedSession);
        chatMessageRepository.save(userMessage);

        return savedSession;
    }

    public Optional<ChatSession> getChatSession(Long sessionId, String userId) {
        return chatSessionRepository.findByIdAndUserId(sessionId, userId);
    }

    public List<ChatMessage> getChatMessages(Long sessionId, String userId) {
        // Verify user owns this session
        Optional<ChatSession> session = chatSessionRepository.findByIdAndUserId(sessionId, userId);
        if (session.isPresent()) {
            return chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(sessionId);
        }
        return List.of();
    }

    public ChatSession updateChatSession(Long sessionId, String lastMessage, String userId) {
        Optional<ChatSession> optionalSession = chatSessionRepository.findByIdAndUserId(sessionId, userId);
        if (optionalSession.isPresent()) {
            ChatSession session = optionalSession.get();
            session.setLastMessage(lastMessage);
            session.setTimestamp(LocalDateTime.now());
            session.setMessageCount(session.getMessageCount() + 1);
            return chatSessionRepository.save(session);
        }
        return null;
    }

    public void addMessageToSession(Long sessionId, String content, MessageRole role, String userId) {
        Optional<ChatSession> optionalSession = chatSessionRepository.findByIdAndUserId(sessionId, userId);
        if (optionalSession.isPresent()) {
            ChatSession session = optionalSession.get();
            ChatMessage message = new ChatMessage(content, role, session);
            chatMessageRepository.save(message);

            // Update session with last message info
            session.setLastMessage(content);
            session.setTimestamp(LocalDateTime.now());
            session.setMessageCount(session.getMessageCount() + 1);
            chatSessionRepository.save(session);
        }
    }

    public boolean deleteChatSession(Long sessionId, String userId) {
        Optional<ChatSession> session = chatSessionRepository.findByIdAndUserId(sessionId, userId);
        if (session.isPresent()) {
            chatSessionRepository.delete(session.get());
            return true;
        }
        return false;
    }

    private String generateTitle(String message) {
        if (message.length() > 50) {
            return message.substring(0, 47) + "...";
        }
        return message;
    }
}
