package com.bitedash.dto; import jakarta.validation.constraints.*; public record OrderItemRequest(@NotNull Long foodItemId,@Min(1) @Max(100) int quantity){}
