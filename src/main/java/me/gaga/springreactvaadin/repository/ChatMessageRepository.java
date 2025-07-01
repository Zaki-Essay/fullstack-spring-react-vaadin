package me.gaga.springreactvaadin.repository;

import me.gaga.springreactvaadin.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatSessionIdOrderByTimestampAsc(Long chatSessionId);
}
