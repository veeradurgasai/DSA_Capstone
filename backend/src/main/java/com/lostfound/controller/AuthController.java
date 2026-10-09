package com.lostfound.controller;

import com.lostfound.dto.AuthDTOs.*;
import com.lostfound.security.UserPrincipal;
import com.lostfound.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Student Registration:
     * Full Name, College Email, Personal Email, Phone, Password.
     * Enters PENDING state waiting for Admin approval.
     */
    @PostMapping("/register")
    public ResponseEntity<RegistrationStatusResponse> registerStudent(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerStudent(request));
    }

    /**
     * Student Login:
     * Full Name, College Email, Password.
     * Checks credentials and APPROVED status.
     */
    @PostMapping("/student/login")
    public ResponseEntity<AuthResponse> loginStudent(@Valid @RequestBody StudentLoginRequest request) {
        return ResponseEntity.ok(authService.loginStudent(request));
    }

    /**
     * General / Standard Login endpoint (handles both student and admin login models)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Send OTP for Admin Registration.
     */
    @PostMapping("/admin/send-otp")
    public ResponseEntity<Map<String, Object>> sendAdminOtp(@Valid @RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendAdminOtp(request));
    }

    /**
     * Admin Registration:
     * Full Name, Email, Admin Registration Code, OTP.
     */
    @PostMapping("/admin/register")
    public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        return ResponseEntity.ok(authService.registerAdmin(request));
    }

    /**
     * Admin Login:
     * Full Name, Email, Admin Code (NO OTP).
     */
    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> loginAdmin(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(authService.loginAdmin(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getProfile(principal.getId()));
    }

    /**
     * Account Deletion with identity verification (password + confirmation keyword).
     */
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DeleteAccountRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        authService.deleteAccount(principal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Your account has been successfully deleted and deactivated."));
    }
}
