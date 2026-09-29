package com.bitedash.dto; import jakarta.validation.constraints.*; public record ReviewRequest(@Min(1) @Max(5) int rating,@Size(max=1000) String comment){}
