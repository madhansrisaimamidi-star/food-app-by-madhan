package com.bitedash.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="users") public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,length=100) private String name;
 @Column(nullable=false,unique=true,length=150) private String email; @Column(name="password_hash",nullable=false) private String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role=Role.CUSTOMER; @Column(name="created_at") private LocalDateTime createdAt=LocalDateTime.now();
 protected User() {} public User(String name,String email,String passwordHash){this.name=name;this.email=email;this.passwordHash=passwordHash;}
 public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;} public Role getRole(){return role;} public LocalDateTime getCreatedAt(){return createdAt;}
}
