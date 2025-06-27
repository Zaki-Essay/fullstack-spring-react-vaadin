package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import org.springframework.ai.chat.client.ChatClient;
import reactor.core.publisher.Flux;

@BrowserCallable
@AnonymousAllowed
public class ChatIaService {
    private final ChatClient chatClient;

    public ChatIaService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public Flux<String> sendMessage(String prompt) {

            return chatClient.prompt()
                    .user(prompt)
                    .stream()
                    .content();

    }

    public Flux<String> sendMessageWithSystemPrompt(String userMessage, String systemPrompt) {

            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(userMessage)
                    .stream()
                    .content();

    }
}