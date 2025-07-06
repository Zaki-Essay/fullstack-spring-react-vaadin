package me.gaga.springreactvaadin.repository;

import me.gaga.springreactvaadin.entities.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findByStatus(Document.Status status);
    List<Document> findByNameContainingIgnoreCase(String name);
}
