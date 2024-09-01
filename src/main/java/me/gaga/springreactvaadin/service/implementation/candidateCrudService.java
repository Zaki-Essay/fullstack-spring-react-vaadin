package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.hilla.crud.CrudRepositoryService;
import me.gaga.springreactvaadin.entities.Candidate;
import me.gaga.springreactvaadin.repository.CandidateRepository;
import org.springframework.lang.NonNullApi;

@BrowserCallable
@AnonymousAllowed
public class candidateCrudService extends CrudRepositoryService<Candidate, Long, CandidateRepository> {
}
