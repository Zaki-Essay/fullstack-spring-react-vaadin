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
public class ChatMessageDTO {
    private String id;
    private String content;
    private String role;
    private LocalDateTime timestamp;
}
