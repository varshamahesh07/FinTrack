package com.fintrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    @Builder.Default
    private boolean success = true;
    private String message;
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private UserResponse user;
}
