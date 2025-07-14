package me.gaga.springreactvaadin.service.implementation;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import me.gaga.springreactvaadin.entities.User;
import me.gaga.springreactvaadin.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@BrowserCallable
@AnonymousAllowed
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextHolderStrategy securityContextHolderStrategy;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();
    }

    /**
     * Register a new user
     */
    public boolean register(String username, String password, String email) {
        try {
            // Check if user already exists
            if (userRepository.findByUsername(username).isPresent()) {
                log.warn("User registration failed: Username {} already exists", username);
                return false; // Username already exists
            }

            // Create new user
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setEmail(email);
            user.setEnabled(true);
            user.setRole("USER");
            user.setCreatedAt(LocalDateTime.now());

            userRepository.save(user);
            log.info("User {} registered successfully", username);
            return true;
        } catch (Exception e) {
            log.error("Error during user registration: ", e);
            return false;
        }
    }

    /**
     * Login user
     */
    public boolean login(String username, String password) {
        try {
            // Create authentication token
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(username, password);

            log.debug("Attempting login for user: {}", username);

            // Authenticate
            Authentication authentication = authenticationManager.authenticate(authToken);

            // Set security context
            SecurityContext context = securityContextHolderStrategy.createEmptyContext();
            context.setAuthentication(authentication);
            securityContextHolderStrategy.setContext(context);

            // Persist security context to session
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attr.getRequest();
            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            log.info("User {} logged in successfully", username);
            return true;
        } catch (AuthenticationException e) {
            log.warn("Authentication failed for user {}: {}", username, e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Error during login for user {}: ", username, e);
            return false;
        }
    }

    /**
     * Logout user
     */
    public void logout() {
        try {
            // Clear security context
            SecurityContext context = securityContextHolderStrategy.createEmptyContext();
            securityContextHolderStrategy.setContext(context);

            // Invalidate session if exists
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attr.getRequest();
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            log.info("User logged out successfully");
        } catch (Exception e) {
            log.error("Error during logout: ", e);
        }
    }

    /**
     * Get current authenticated user
     */
    public Optional<User> getCurrentUser() {
        try {
            Authentication authentication = securityContextHolderStrategy.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated() ||
                    "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.empty();
            }

            String username = authentication.getName();
            return userRepository.findByUsername(username);
        } catch (Exception e) {
            log.error("Error getting current user: ", e);
            return Optional.empty();
        }
    }

    /**
     * Check if user is authenticated
     */
    public boolean isAuthenticated() {
        Authentication authentication = securityContextHolderStrategy.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal());
    }
}