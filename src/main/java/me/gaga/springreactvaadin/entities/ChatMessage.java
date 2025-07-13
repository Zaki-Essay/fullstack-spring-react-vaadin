package me.gaga.springreactvaadin.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;



@AllArgsConstructor
@NoArgsConstructor
@Entity
@Data
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageRole role;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_session_id", nullable = false)
    private ChatSession chatSession;


    public ChatMessage(String firstMessage, MessageRole messageRole, ChatSession savedSession) {
        this.content = firstMessage;
        this.role = messageRole;
        this.timestamp = LocalDateTime.now();
        this.chatSession = savedSession;
    }
}
