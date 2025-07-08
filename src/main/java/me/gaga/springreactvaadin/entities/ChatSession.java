package me.gaga.springreactvaadin.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "last_message", columnDefinition = "TEXT")
    private String lastMessage;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "message_count")
    private Integer messageCount = 0;

    @Column(name = "user_id")
    private String userId; // For multi-user support

    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChatMessage> messages = new ArrayList<>();

    public ChatSession(String title, String userId) {
        this.title = title;
        this.userId = userId;
        this.timestamp = LocalDateTime.now();
    }
}
