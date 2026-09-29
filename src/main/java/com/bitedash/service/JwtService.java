package com.bitedash.service;

import com.bitedash.entity.User;
import com.bitedash.exception.BadRequestException;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class JwtService {

    private static final String SECRET = "FoodieExpressSecretKeyForJwtAuthorizationTokens2026KeyLength64BytesSecure!";
    private static final long EXPIRATION_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    public String generateToken(User user) {
        long now = System.currentTimeMillis();
        long exp = now + EXPIRATION_MS;

        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payloadJson = String.format(
                "{\"sub\":\"%d\",\"email\":\"%s\",\"name\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}",
                user.getId(),
                escape(user.getEmail()),
                escape(user.getName()),
                user.getRole().name(),
                now / 1000,
                exp / 1000
        );

        String encodedHeader = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));
        String encodedPayload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));
        String unsignedToken = encodedHeader + "." + encodedPayload;

        String signature = sign(unsignedToken, SECRET);
        return unsignedToken + "." + signature;
    }

    public Long validateAndGetUserId(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Missing authorization token");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new BadRequestException("Malformed authorization token");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        String expectedSignature = sign(unsignedToken, SECRET);

        if (!MessageDigest.isEqual(parts[2].getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            throw new BadRequestException("Invalid token signature. Access denied.");
        }

        try {
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            
            // Check expiration
            int expIndex = payloadJson.indexOf("\"exp\":");
            if (expIndex != -1) {
                int start = expIndex + 6;
                int end = payloadJson.indexOf("}", start);
                int comma = payloadJson.indexOf(",", start);
                if (comma != -1 && comma < end) end = comma;
                long expSec = Long.parseLong(payloadJson.substring(start, end).trim());
                if (System.currentTimeMillis() / 1000 > expSec) {
                    throw new BadRequestException("Authorization token has expired. Please log in again.");
                }
            }

            // Extract subject (user ID)
            int subIndex = payloadJson.indexOf("\"sub\":\"");
            if (subIndex != -1) {
                int start = subIndex + 7;
                int end = payloadJson.indexOf("\"", start);
                return Long.parseLong(payloadJson.substring(start, end));
            }

            throw new BadRequestException("Token payload missing subject");
        } catch (NumberFormatException e) {
            throw new BadRequestException("Invalid user ID in authorization token");
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid token encoding");
        }
    }

    private String sign(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error computing token signature", e);
        }
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
