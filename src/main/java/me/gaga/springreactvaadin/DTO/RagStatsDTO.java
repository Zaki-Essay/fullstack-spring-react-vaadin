package me.gaga.springreactvaadin.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RagStatsDTO {
    private long totalProcessedDocuments;
    private long totalChunks;
    private long processingDocuments;
    private long failedDocuments;
}
