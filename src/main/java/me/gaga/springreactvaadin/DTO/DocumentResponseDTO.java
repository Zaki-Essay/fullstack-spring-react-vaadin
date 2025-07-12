package me.gaga.springreactvaadin.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponseDTO {
    private String id;
    private String name;
    private String type;
    private Long size;
    private LocalDateTime uploadDate;
    private String status;
    private Integer chunks;
}
