package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import me.gaga.springreactvaadin.DTO.DocumentResponseDTO;
import me.gaga.springreactvaadin.entities.ChatMessage;
import me.gaga.springreactvaadin.entities.Document;
import me.gaga.springreactvaadin.entities.DocumentStatus;
import me.gaga.springreactvaadin.repository.DocumentRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.PgVectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@BrowserCallable
@AnonymousAllowed
@Slf4j
public class RagService {

    private final ChatClient chatClient;
    private final PgVectorStore vectorStore;
    private final DocumentRepository documentRepository;
    private final ChatHistoryService chatHistoryService;

    public RagService(ChatClient.Builder chatClient,
                      PgVectorStore vectorStore,
                      DocumentRepository documentRepository,
                      ChatHistoryService chatHistoryService) {
        this.chatClient = chatClient.build();
        this.vectorStore = vectorStore;
        this.documentRepository = documentRepository;
        this.chatHistoryService = chatHistoryService;
    }

    /**
     * Process and store document in vector database
     */
    public void processDocument(String documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        try {
            log.info("Starting document processing for: {}", document.getName());

            // Read file content
            String content = readFileContent(document.getFilePath());

            // Validate content
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("Document content is empty or could not be extracted");
            }

            log.info("Content extracted successfully, length: {}", content.length());

            // Split into chunks
            List<String> chunks = splitIntoChunks(content, 1000);
            log.info("Document split into {} chunks", chunks.size());

            // Create vector documents with unique IDs
            List<org.springframework.ai.document.Document> vectorDocs = new ArrayList<>();
            for (int i = 0; i < chunks.size(); i++) {
                String chunkId = UUID.randomUUID().toString();
                Map<String, Object> metadata = Map.of(
                        "documentId", documentId,
                        "filename", document.getName(),
                        "chunkIndex", i,
                        "totalChunks", chunks.size()
                );

                vectorDocs.add(new org.springframework.ai.document.Document(chunkId, chunks.get(i), metadata));
            }

            // Store in vector database
            try {
                vectorStore.add(vectorDocs);
                log.info("Successfully stored {} vector documents", vectorDocs.size());
            } catch (Exception e) {
                log.error("Failed to store vector documents: {}", e.getMessage());
                throw new RuntimeException("Failed to store documents in vector database", e);
            }

            // Update document status
            document.setStatus(DocumentStatus.COMPLETED);
            document.setChunks(chunks.size());
            documentRepository.save(document);

            log.info("Document processed successfully: {}", document.getName());

        } catch (Exception e) {
            log.error("Error processing document {}: {}", document.getName(), e.getMessage(), e);
            document.setStatus(DocumentStatus.FAILED);
            documentRepository.save(document);
            throw new RuntimeException("Failed to process document: " + e.getMessage(), e);
        }
    }

    /**
     * Query documents and get AI response using Ollama Mistral
     */
    public Flux<String> queryWithRag(String query, String userId) {
        try {
            log.info("Processing RAG query: {}", query);

            // Search similar documents
            List<org.springframework.ai.document.Document> similarDocs = vectorStore.similaritySearch(
                    SearchRequest.query(query).withTopK(5)
            );
            log.info("Found {} similar documents", similarDocs.size());

            // Build context from retrieved documents
            String context = similarDocs.stream()
                    .map(doc -> {
                        String content = doc.getContent();
                        String filename = (String) doc.getMetadata().get("filename");
                        return String.format("From %s:\n%s", filename, content);
                    })
                    .collect(Collectors.joining("\n\n---\n\n"));

            // Create system prompt with context - optimized for Mistral
            String systemPrompt = """
                You are a helpful AI assistant. Use the following context to answer the user's question accurately and concisely.
                
                Context from documents:
                %s
                
                Instructions:
                - Base your answer on the provided context
                - If the context doesn't contain relevant information, clearly state that you don't have enough information
                - Be direct and helpful in your response
                - Don't make up information not present in the context
                """.formatted(context);

            // Generate response using Mistral
            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(query)
                    .stream()
                    .content();

        } catch (Exception e) {
            log.error("Error in RAG query: {}", e.getMessage(), e);
            return Flux.just("Sorry, I encountered an error while processing your request: " + e.getMessage());
        }
    }

    /**
     * Query with chat history support using Ollama Mistral
     */
    public Flux<String> queryWithRagAndHistory(String query, String userId, Long sessionId) {
        try {
            log.info("Processing RAG query with history: {}", query);

            // Get chat history if session exists
            List<ChatMessage> history = sessionId != null ?
                    chatHistoryService.getChatMessages(sessionId, userId) :
                    List.of();

            // Search similar documents
            List<org.springframework.ai.document.Document> similarDocs = vectorStore.similaritySearch(
                    SearchRequest.query(query).withTopK(5)
            );
            log.info("Found {} similar documents", similarDocs.size());

            // Build context
            String context = similarDocs.stream()
                    .map(doc -> {
                        String content = doc.getContent();
                        String filename = (String) doc.getMetadata().get("filename");
                        return String.format("From %s:\n%s", filename, content);
                    })
                    .collect(Collectors.joining("\n\n---\n\n"));

            // Build conversation history
            String conversationHistory = history.stream()
                    .map(msg -> msg.getRole().name() + ": " + msg.getContent())
                    .collect(Collectors.joining("\n"));

            // Create enhanced system prompt optimized for Mistral
            String systemPrompt = """
                You are a helpful AI assistant. Use the following context and conversation history to answer the user's question.
                
                Context from documents:
                %s
                
                Previous conversation:
                %s
                
                Instructions:
                - Use both the document context and conversation history to provide a comprehensive answer
                - Be consistent with previous responses in the conversation
                - If the context doesn't contain relevant information, clearly state this
                - Provide accurate and helpful responses based on available information
                """.formatted(context, conversationHistory);

            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(query)
                    .stream()
                    .content();

        } catch (Exception e) {
            log.error("Error in RAG query with history: {}", e.getMessage(), e);
            return Flux.just("Sorry, I encountered an error while processing your request: " + e.getMessage());
        }
    }

    /**
     * Simple query without RAG for testing Ollama connection
     */
    public Flux<String> simpleQuery(String query) {
        try {
            log.info("Processing simple query: {}", query);

            return chatClient.prompt()
                    .user(query)
                    .stream()
                    .content();

        } catch (Exception e) {
            log.error("Error in simple query: {}", e.getMessage(), e);
            return Flux.just("Sorry, I encountered an error while processing your request: " + e.getMessage());
        }
    }

    /**
     * Get available documents for RAG
     */
    public List<DocumentResponseDTO> getProcessedDocuments() {
        return documentRepository.findByStatus(DocumentStatus.COMPLETED)
                .stream()
                .map(this::convertToDocumentResponse)
                .collect(Collectors.toList());
    }

    private String readFileContent(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        String extension = getFileExtension(path.getFileName().toString());

        log.info("Reading file: {} with extension: {}", filePath, extension);

        switch (extension.toLowerCase()) {
            case "txt":
            case "md":
                return Files.readString(path);
            case "pdf":
                return readPdfContent(path);
            case "docx":
                return readDocxContent(path);
            default:
                throw new RuntimeException("Unsupported file type: " + extension);
        }
    }

    private String readPdfContent(Path path) throws IOException {
        try (PDDocument document = PDDocument.load(path.toFile())) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String content = pdfStripper.getText(document);
            log.info("PDF content extracted, length: {}", content.length());
            return content;
        } catch (IOException e) {
            log.error("Failed to read PDF content: {}", e.getMessage());
            throw new IOException("Failed to extract PDF content", e);
        }
    }

    private String readDocxContent(Path path) throws IOException {
        // For now, return a placeholder - you can implement Apache POI DOCX reading here
        log.warn("DOCX content extraction not implemented yet for: {}", path.getFileName());
        return "DOCX content extraction not implemented yet";
    }

    private List<String> splitIntoChunks(String text, int maxChunkSize) {
        List<String> chunks = new ArrayList<>();

        // First, try to split by paragraphs
        String[] paragraphs = text.split("\n\n");
        StringBuilder currentChunk = new StringBuilder();

        for (String paragraph : paragraphs) {
            // If adding this paragraph would exceed the limit
            if (currentChunk.length() + paragraph.length() > maxChunkSize) {
                // Save current chunk if it's not empty
                if (currentChunk.length() > 0) {
                    chunks.add(currentChunk.toString().trim());
                    currentChunk = new StringBuilder();
                }

                // If the paragraph itself is too long, split it by sentences
                if (paragraph.length() > maxChunkSize) {
                    String[] sentences = paragraph.split("\\. ");
                    for (String sentence : sentences) {
                        if (currentChunk.length() + sentence.length() > maxChunkSize) {
                            if (currentChunk.length() > 0) {
                                chunks.add(currentChunk.toString().trim());
                                currentChunk = new StringBuilder();
                            }
                        }
                        currentChunk.append(sentence).append(". ");
                    }
                } else {
                    currentChunk.append(paragraph).append("\n\n");
                }
            } else {
                currentChunk.append(paragraph).append("\n\n");
            }
        }

        // Add the last chunk if it's not empty
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }

        log.info("Text split into {} chunks", chunks.size());
        return chunks;
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