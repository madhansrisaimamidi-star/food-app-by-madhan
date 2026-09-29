package com.bitedash.dto;

import com.bitedash.entity.Role;
import com.bitedash.entity.User;

public record UserResponse(Long id, String name, String email, Role role, String token) {
    public static UserResponse of(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), null);
    }

    public static UserResponse of(User u, String token) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), token);
    }
}
