package me.gaga.springreactvaadin.repository;

import me.gaga.springreactvaadin.entities.Document;
import me.gaga.springreactvaadin.entities.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findByStatus(DocumentStatus status);
    List<Document> findByNameContainingIgnoreCase(String name);
    long countByStatus(DocumentStatus status);

    @Query("SELECT COALESCE(SUM(d.chunks), 0) FROM Document d WHERE d.status = :status")
    long sumChunksByStatus(@Param("status") DocumentStatus status);

    List<Document> findByStatusAndUploadDateAfter(DocumentStatus status, LocalDateTime date);
}
