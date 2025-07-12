package me.gaga.springreactvaadin.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProcessingResultDTO {
    private boolean success;
    private String message;
    private String documentId;
    private int chunksCreated;
}
