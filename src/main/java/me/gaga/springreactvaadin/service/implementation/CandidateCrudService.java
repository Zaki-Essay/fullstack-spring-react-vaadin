package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.hilla.crud.CrudRepositoryService;
import me.gaga.springreactvaadin.entities.Candidate;
import me.gaga.springreactvaadin.repository.CandidateRepository;

@BrowserCallable
@AnonymousAllowed
public class CandidateCrudService extends CrudRepositoryService<Candidate, Long, CandidateRepository> {
}
