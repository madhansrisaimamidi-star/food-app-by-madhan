package com.foodieexpress.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api")
public class FoodDeliveryController {
    private final AtomicLong userIds = new AtomicLong(1);
    private final AtomicLong orderIds = new AtomicLong(1);
    private final Map<Long, User> users = new ConcurrentHashMap<>();
    private final Map<Long, Order> orders = new ConcurrentHashMap<>();
    private final List<Restaurant> restaurants = List.of(
            new Restaurant(1L, "Crust & Craft", "Italian · Pizza", "25–30 min", "Pizza", "🍕", "4.8"),
            new Restaurant(2L, "Burger Singh", "Burgers · American", "20–25 min", "Burgers", "🍔", "4.7"),
            new Restaurant(3L, "Green Theory", "Healthy · Salads", "15–20 min", "Healthy", "🥗", "4.9"),
            new Restaurant(4L, "The Curry Leaf", "North Indian", "30–35 min", "Indian", "🍛", "4.6"),
            new Restaurant(5L, "Wok This Way", "Asian · Noodles", "25–30 min", "Asian", "🍜", "4.8"),
            new Restaurant(6L, "Sugar Rush", "Desserts · Bakery", "15–20 min", "Desserts", "🍰", "4.9")
    );

    @GetMapping("/restaurants")
    public List<Restaurant> restaurants(@RequestParam(defaultValue = "") String search,
                                        @RequestParam(defaultValue = "All") String category) {
        String query = search.toLowerCase();
        return restaurants.stream()
                .filter(r -> "All".equalsIgnoreCase(category) || r.category().equalsIgnoreCase(category))
                .filter(r -> query.isBlank() || (r.name() + " " + r.cuisine()).toLowerCase().contains(query))
                .toList();
    }

    @GetMapping("/restaurants/{restaurantId}/items")
    public List<FoodItem> items(@PathVariable long restaurantId) {
        Restaurant restaurant = restaurants.stream().filter(r -> r.id() == restaurantId).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        return List.of(new FoodItem(restaurantId, restaurant.name() + " Special", "Chef's recommended dish",
                restaurant.category(), new BigDecimal("299.00"), restaurant.emoji()));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (users.values().stream().anyMatch(user -> user.email().equalsIgnoreCase(request.email()))) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        long id = userIds.getAndIncrement();
        User user = new User(id, request.name(), request.email(), request.password(), "CUSTOMER");
        users.put(id, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new UserResponse(id, user.name(), user.email(), user.role()));
    }

    @PostMapping("/auth/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        return users.values().stream()
                .filter(user -> user.email().equalsIgnoreCase(request.email()) && user.password().equals(request.password()))
                .findFirst()
                .map(user -> new UserResponse(user.id(), user.name(), user.email(), user.role()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody CreateOrderRequest request) {
        long id = orderIds.getAndIncrement();
        BigDecimal total = request.items().stream()
                .map(item -> item.unitPrice().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(new BigDecimal("39.00"));
        Order order = new Order(id, request.userId(), request.deliveryAddress(), request.items(), total, "PLACED", Instant.now());
        orders.put(id, order);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/orders/my")
    public List<Order> orderHistory(@RequestParam long userId) {
        return orders.values().stream().filter(order -> order.userId() == userId).toList();
    }

    @PatchMapping("/orders/{orderId}/cancel")
    public Order cancelOrder(@PathVariable long orderId) {
        Order order = orders.get(orderId);
        if (order == null) throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        if (!"PLACED".equals(order.status()) && !"CONFIRMED".equals(order.status())) {
            throw new ApiException(HttpStatus.CONFLICT, "This order can no longer be cancelled");
        }
        Order cancelled = new Order(order.id(), order.userId(), order.deliveryAddress(), order.items(),
                order.total(), "CANCELLED", order.createdAt());
        orders.put(orderId, cancelled);
        return cancelled;
    }

    @PostMapping("/restaurants/{restaurantId}/reviews")
    public Map<String, Object> review(@PathVariable long restaurantId, @Valid @RequestBody ReviewRequest request) {
        restaurants.stream().filter(r -> r.id() == restaurantId).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        return Map.of("restaurantId", restaurantId, "userId", request.userId(), "rating", request.rating(),
                "comment", request.comment(), "message", "Review submitted");
    }

    public record Restaurant(long id, String name, String cuisine, String deliveryTime, String category,
                             String emoji, String rating) {}
    public record FoodItem(long restaurantId, String name, String description, String category,
                           BigDecimal price, String emoji) {}
    public record User(long id, String name, String email, String password, String role) {}
    public record UserResponse(long id, String name, String email, String role) {}
    public record Order(long id, long userId, String deliveryAddress, List<OrderItem> items,
                        BigDecimal total, String status, Instant createdAt) {}
    public record OrderItem(long foodItemId, String name, @Min(1) int quantity, BigDecimal unitPrice) {}
    public record RegisterRequest(@NotBlank String name, @Email @NotBlank String email, @NotBlank String password) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record CreateOrderRequest(@Min(1) long userId, @NotBlank String deliveryAddress,
                                     @Valid List<OrderItem> items) {}
    public record ReviewRequest(@Min(1) long userId, @Min(1) int rating, @NotBlank String comment) {}

    static class ApiException extends RuntimeException {
        private final HttpStatus status;
        ApiException(HttpStatus status, String message) {
            super(message);
            this.status = status;
        }
        HttpStatus status() { return status; }
    }
}
