package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gaga.springreactvaadin.DTO.DocumentResponseDTO;
import me.gaga.springreactvaadin.DTO.FileUploadResponseDTO;
import me.gaga.springreactvaadin.entities.Document;
import me.gaga.springreactvaadin.entities.DocumentStatus;
import me.gaga.springreactvaadin.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@BrowserCallable
@AnonymousAllowed
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final DocumentRepository documentRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "docx", "txt", "md");
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    public FileUploadResponseDTO uploadFile(MultipartFile file) {
        try {
            // Validate file
            validateFile(file);

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;

            // Save file to disk
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create document entity
            Document document = Document.builder()
                    .id(UUID.randomUUID().toString())
                    .name(originalFilename)
                    .type(fileExtension.toUpperCase())
                    .size(file.getSize())
                    .filePath(filePath.toString())
                    .uploadDate(LocalDateTime.now())
                    .status(DocumentStatus.PROCESSING)
                    .chunks(0)
                    .build();

            // Save to database
            documentRepository.save(document);

            log.info("File uploaded successfully: {}", originalFilename);

            return FileUploadResponseDTO.builder()
                    .success(true)
                    .message("File uploaded successfully")
                    .document(convertToDocumentResponse(document))
                    .build();

        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            return FileUploadResponseDTO.builder()
                    .success(false)
                    .message("Error uploading file: " + e.getMessage())
                    .build();
        }
    }

    public List<FileUploadResponseDTO> uploadMultipleFiles(List<MultipartFile> files) {
        return files.stream()
                .map(this::uploadFile)
                .collect(Collectors.toList());
    }

    public List<DocumentResponseDTO> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::convertToDocumentResponse)
                .collect(Collectors.toList());
    }

    public boolean deleteDocument(String documentId) {
        try {
            Document document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Delete file from disk
            Path filePath = Paths.get(document.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

            // Delete from database
            documentRepository.delete(document);

            log.info("Document deleted successfully: {}", document.getName());
            return true;

        } catch (Exception e) {
            log.error("Error deleting document: {}", e.getMessage());
            return false;
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 10MB");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new RuntimeException("Invalid filename");
        }

        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new RuntimeException("File type not supported. Allowed types: " + ALLOWED_EXTENSIONS);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    private DocumentResponseDTO convertToDocumentResponse(Document document) {
        return DocumentResponseDTO.builder()
                .id(document.getId())
                .name(document.getName())
                .type(document.getType())
                .size(document.getSize())
                .uploadDate(document.getUploadDate())
                .status(document.getStatus().name().toLowerCase())
                .chunks(document.getChunks())
                .build();
    }
}