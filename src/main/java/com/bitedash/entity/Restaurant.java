package com.bitedash.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    private String cuisine;
    private String address;

    @Column(name = "image_url")
    private String imageUrl;

    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "delivery_minutes")
    private String deliveryMinutes;

    @Column(name = "is_active")
    private boolean active = true;

    protected Restaurant() {}

    public Restaurant(String name, String cuisine, String address, String imageUrl, BigDecimal rating, String deliveryMinutes, boolean active) {
        this.name = name;
        this.cuisine = cuisine;
        this.address = address;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.deliveryMinutes = deliveryMinutes;
        this.active = active;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCuisine() { return cuisine; }
    public String getAddress() { return address; }
    public String getImageUrl() { return imageUrl; }
    public BigDecimal getRating() { return rating; }
    public String getDeliveryMinutes() { return deliveryMinutes; }
    public boolean isActive() { return active; }
}
