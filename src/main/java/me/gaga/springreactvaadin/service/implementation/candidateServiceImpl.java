package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import lombok.RequiredArgsConstructor;
import me.gaga.springreactvaadin.entities.Candidate;
import me.gaga.springreactvaadin.repository.CandidateRepository;
import me.gaga.springreactvaadin.service.CandidateService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@BrowserCallable
@AnonymousAllowed
public class candidateServiceImpl implements CandidateService {
    private final CandidateRepository candidateRepository;


    @Override
    public List<Candidate> findAllCandidate() {
        return candidateRepository.findAll();
    }

    @Override
    public Candidate save(Candidate candidate) {
        return candidateRepository.save(candidate);
    }
}
