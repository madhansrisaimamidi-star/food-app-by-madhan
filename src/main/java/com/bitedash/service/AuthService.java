package com.bitedash.service;

import com.bitedash.dto.LoginRequest;
import com.bitedash.dto.RegisterRequest;
import com.bitedash.dto.UserResponse;
import com.bitedash.entity.User;
import com.bitedash.exception.BadRequestException;
import com.bitedash.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest r) {
        if (users.existsByEmailIgnoreCase(r.email())) {
            throw new BadRequestException("Email is already registered. Please log in.");
        }
        User user = users.save(new User(r.name().trim(), r.email().trim().toLowerCase(), encoder.encode(r.password())));
        String token = jwtService.generateToken(user);
        return UserResponse.of(user, token);
    }

    public UserResponse login(LoginRequest r) {
        User user = users.findByEmailIgnoreCase(r.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!encoder.matches(r.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }
        String token = jwtService.generateToken(user);
        return UserResponse.of(user, token);
    }
}
