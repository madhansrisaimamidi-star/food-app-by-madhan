package com.bitedash.controller;

import com.bitedash.dto.CreateOrderRequest;
import com.bitedash.dto.OrderResponse;
import com.bitedash.exception.BadRequestException;
import com.bitedash.service.JwtService;
import com.bitedash.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;
    private final JwtService jwtService;

    public OrderController(OrderService service, JwtService jwtService) {
        this.service = service;
        this.jwtService = jwtService;
    }

    private Long resolveUserId(String authHeader, Long xUserId) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            return jwtService.validateAndGetUserId(token);
        }
        if (xUserId != null) {
            return xUserId;
        }
        throw new BadRequestException("Authorization token (Bearer token) or X-User-Id is required to access orders.");
    }

    @PostMapping
    public OrderResponse create(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long xUserId,
            @Valid @RequestBody CreateOrderRequest request) {
        Long userId = resolveUserId(authHeader, xUserId);
        return service.create(userId, request);
    }

    @GetMapping("/my")
    public List<OrderResponse> list(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long xUserId) {
        Long userId = resolveUserId(authHeader, xUserId);
        return service.list(userId);
    }

    @PatchMapping("/{id}/cancel")
    public OrderResponse cancel(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long xUserId,
            @PathVariable Long id) {
        Long userId = resolveUserId(authHeader, xUserId);
        return service.cancel(userId, id);
    }
}
