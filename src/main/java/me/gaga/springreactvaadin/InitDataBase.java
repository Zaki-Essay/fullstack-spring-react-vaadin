package me.gaga.springreactvaadin;

import lombok.RequiredArgsConstructor;
import me.gaga.springreactvaadin.entities.Candidate;
import me.gaga.springreactvaadin.service.CandidateService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@RequiredArgsConstructor
public class InitDataBase implements ApplicationRunner {

    private final CandidateService candidateService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        for (int i = 0; i < 100; i++) {
            Candidate candidate = Candidate.builder()
                    .name("name"+i)
                    .email("name"+i+"@gmail.com")
                    .build();

            candidateService.save(candidate);
        }
    }
}
