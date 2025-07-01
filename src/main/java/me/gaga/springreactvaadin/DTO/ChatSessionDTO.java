package me.gaga.springreactvaadin.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ChatSessionDTO {
    private String id;
    private String title;
    private String lastMessage;
    private LocalDateTime timestamp;
    private Integer messageCount;
}