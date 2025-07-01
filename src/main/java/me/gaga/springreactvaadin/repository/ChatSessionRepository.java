package me.gaga.springreactvaadin.repository;

import me.gaga.springreactvaadin.entities.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserIdOrderByTimestampDesc(String userId);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.userId = :userId AND " +
            "(LOWER(cs.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(cs.lastMessage) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<ChatSession> findByUserIdAndSearchTerm(@Param("userId") String userId,
                                                @Param("searchTerm") String searchTerm);

    Optional<ChatSession> findByIdAndUserId(Long id, String userId);
}
