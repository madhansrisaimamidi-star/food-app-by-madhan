package com.foodieexpress.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handle(RuntimeException exception) {
        if (exception instanceof FoodDeliveryController.ApiException apiException) {
            return ResponseEntity.status(apiException.status()).body(Map.of("error", apiException.getMessage()));
        }
        return ResponseEntity.internalServerError().body(Map.of("error", "Unexpected server error"));
    }
}
