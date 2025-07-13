package me.gaga.springreactvaadin.service.implementation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gaga.springreactvaadin.entities.Document;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentProcessingService {

    public String extractTextFromDocument(Document document) {
        try {
            Path filePath = Paths.get(document.getFilePath());

            return switch (document.getType().toLowerCase()) {
                case "txt", "md" -> extractTextFromPlainText(filePath);
                case "pdf" -> extractTextFromPdf(filePath);
                case "docx" -> extractTextFromDocx(filePath);
                default -> throw new RuntimeException("Unsupported document type: " + document.getType());
            };

        } catch (Exception e) {
            log.error("Error extracting text from document: {}", e.getMessage());
            throw new RuntimeException("Error extracting text from document: " + e.getMessage());
        }
    }

    private String extractTextFromPlainText(Path filePath) throws IOException {
        return Files.readString(filePath, StandardCharsets.UTF_8);
    }

    private String extractTextFromPdf(Path filePath) throws IOException {
        // You would need to add Apache PDFBox dependency for this
        // For now, returning placeholder
        return "PDF text extraction not implemented. Add Apache PDFBox dependency.";
    }

    private String extractTextFromDocx(Path filePath) throws IOException {
        // You would need to add Apache POI dependency for this
        // For now, returning placeholder
        return "DOCX text extraction not implemented. Add Apache POI dependency.";
    }
}
