package me.gaga.springreactvaadin.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponseDTO {
    private boolean success;
    private String message;
    private DocumentResponseDTO document;
}
