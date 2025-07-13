package me.gaga.springreactvaadin.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentSearchResultDTO {
    private String chunkId;
    private String documentId;
    private String documentName;
    private String documentType;
    private int chunkIndex;
    private String content;
    private double score;
}
