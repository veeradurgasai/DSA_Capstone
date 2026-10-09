package com.lostfound.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public record LoginRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record RegisterRequest(
            @NotBlank(message = "Name is required")
            @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
            String name,

            @NotBlank(message = "College email is required")
            @Email(message = "Invalid college email format")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 6, message = "Password must be at least 6 characters")
            String password,

            String phone,

            @Email(message = "Invalid personal email format")
            String personalEmail
    ) {
        public RegisterRequest(String name, String email, String password, String phone) {
            this(name, email, password, phone, null);
        }
    }

    public record StudentLoginRequest(
            @NotBlank(message = "Full name is required")
            String name,

            @NotBlank(message = "College email is required")
            @Email(message = "Invalid college email format")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record AdminRegisterRequest(
            @NotBlank(message = "Full name is required")
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Mobile phone number is required")
            String phone,

            @NotBlank(message = "Admin registration code is required")
            String adminCode,

            @NotBlank(message = "OTP is required")
            String otp,

            String verificationId
    ) {
        public AdminRegisterRequest(String name, String email, String phone, String adminCode, String otp) {
            this(name, email, phone, adminCode, otp, null);
        }
        public AdminRegisterRequest(String name, String email, String adminCode, String otp) {
            this(name, email, null, adminCode, otp, null);
        }
    }

    public record AdminLoginRequest(
            @NotBlank(message = "Full name is required")
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Admin registration code is required")
            String adminCode
    ) {}

    public record SendOtpRequest(
            String email,
            String phone,
            String adminCode
    ) {
        public SendOtpRequest(String email, String phone) {
            this(email, phone, null);
        }
    }

    public record ApprovalRequest(
            @NotBlank(message = "Status is required")
            String status
    ) {}

    public record RegistrationStatusResponse(
            String message,
            String accountStatus,
            Long userId,
            String name,
            String email
    ) {}

    public record AuthResponse(
            String token,
            String tokenType,
            Long userId,
            String name,
            String email,
            String role,
            String accountStatus
    ) {
        public AuthResponse(String token, Long userId, String name, String email, String role) {
            this(token, "Bearer", userId, name, email, role, "APPROVED");
        }

        public AuthResponse(String token, Long userId, String name, String email, String role, String accountStatus) {
            this(token, "Bearer", userId, name, email, role, accountStatus);
        }
    }

    public record UserProfileResponse(
            Long id,
            String name,
            String email,
            String phone,
            String role,
            boolean isActive,
            String personalEmail,
            String accountStatus,
            java.time.LocalDateTime createdAt
    ) {
        public UserProfileResponse(Long id, String name, String email, String phone, String role, boolean isActive) {
            this(id, name, email, phone, role, isActive, null, "APPROVED", null);
        }
    }

    public record DeleteAccountRequest(
            @NotBlank(message = "Password or authorization code is required for identity verification")
            String password,

            @NotBlank(message = "Confirmation keyword is required")
            String confirmation
    ) {}
}
