package me.gaga.springreactvaadin.service;

import me.gaga.springreactvaadin.entities.Candidate;

import java.util.List;

public interface CandidateService {

    List<Candidate> findAllCandidate();

    Candidate save(Candidate candidate);
}
