package com.fintrack.service;

import com.fintrack.dto.request.LoginRequest;
import com.fintrack.dto.request.RegisterRequest;
import com.fintrack.dto.response.AuthResponse;
import com.fintrack.dto.response.UserResponse;
import com.fintrack.entity.Budget;
import com.fintrack.entity.User;
import com.fintrack.exception.BadRequestException;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .currency("\u20b9")
                .role("Student Account")
                .build();

        user = userRepository.save(user);

        // Automatically initialize default budget profile for new user
        Budget initialBudget = Budget.builder()
                .user(user)
                .monthlyIncome(new java.math.BigDecimal("5000.00"))
                .food(new java.math.BigDecimal("700.00"))
                .travel(new java.math.BigDecimal("350.00"))
                .education(new java.math.BigDecimal("400.00"))
                .bills(new java.math.BigDecimal("900.00"))
                .other(new java.math.BigDecimal("450.00"))
                .savingsTarget(new java.math.BigDecimal("1200.00"))
                .build();
        budgetRepository.save(initialBudget);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .success(true)
                .message("Account registered successfully")
                .token(token)
                .type("Bearer")
                .user(UserResponse.fromEntity(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .token(token)
                .type("Bearer")
                .user(UserResponse.fromEntity(user))
                .build();
    }
}
