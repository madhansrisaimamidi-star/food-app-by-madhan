package com.bitedash.dto; import jakarta.validation.constraints.*; public record LoginRequest(@NotBlank @Email String email,@NotBlank String password){}
