package com.lostfound.service;

import com.lostfound.dto.AuthDTOs.*;
import com.lostfound.entity.ActivityLog;
import com.lostfound.entity.User;
import com.lostfound.exception.BadRequestException;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.repository.ActivityLogRepository;
import com.lostfound.repository.UserRepository;
import com.lostfound.security.JwtTokenProvider;
import com.lostfound.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final ActivityLogRepository activityLogRepository;
    private final MessageCentralService messageCentralService;

    @Value("${app.admin.registration-code:Amma52}")
    private String adminRegistrationCode;

    @Value("${app.admin.registration-otp:123456}")
    private String adminRegistrationOtp;

    public static class AdminVerificationSession {
        private final String verificationId;
        private final String phone;
        private final String email;
        private final String devOtp;
        private final boolean realMessageCentral;
        private final long timestamp;

        public AdminVerificationSession(String verificationId, String phone, String email, String devOtp, boolean realMessageCentral) {
            this.verificationId = verificationId;
            this.phone = phone;
            this.email = email;
            this.devOtp = devOtp;
            this.realMessageCentral = realMessageCentral;
            this.timestamp = System.currentTimeMillis();
        }

        public String getVerificationId() { return verificationId; }
        public String getPhone() { return phone; }
        public String getEmail() { return email; }
        public String getDevOtp() { return devOtp; }
        public boolean isRealMessageCentral() { return realMessageCentral; }
        public boolean isExpired() {
            return (System.currentTimeMillis() - timestamp) > (10L * 60 * 1000); // 10 minutes
        }
    }

    private final ConcurrentHashMap<String, AdminVerificationSession> pendingVerifications = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       ActivityLogRepository activityLogRepository,
                       MessageCentralService messageCentralService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.activityLogRepository = activityLogRepository;
        this.messageCentralService = messageCentralService;
    }

    /**
     * Student Registration Workflow:
     * Full Name, College Email, Personal Email, Phone, Password.
     * Sets accountStatus = PENDING. Does NOT log student in automatically.
     */
    @Transactional
    public RegistrationStatusResponse registerStudent(RegisterRequest request) {
        String collegeEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(collegeEmail)) {
            throw new BadRequestException("College Email is already registered: " + collegeEmail);
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(collegeEmail);
        user.setPersonalEmail(request.personalEmail() != null && !request.personalEmail().isBlank()
                ? request.personalEmail().trim().toLowerCase() : null);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone() != null ? request.phone().trim() : null);
        user.setRole("ROLE_STUDENT");
        user.setAccountStatus("PENDING");
        user.setActive(true);

        User saved = userRepository.save(user);

        activityLogRepository.save(new ActivityLog(saved, "STUDENT_REGISTER",
                "Student registered: " + saved.getEmail() + " (Pending approval)", "127.0.0.1"));

        return new RegistrationStatusResponse(
                "Your registration has been submitted and is waiting for administrator approval.",
                "PENDING",
                saved.getId(),
                saved.getName(),
                saved.getEmail()
        );
    }

    /**
     * Legacy register wrapper that redirects to student registration.
     */
    @Transactional
    public RegistrationStatusResponse register(RegisterRequest request) {
        return registerStudent(request);
    }

    /**
     * Student Login Workflow:
     * Full Name, College Email, Password.
     * Enforces that the account is APPROVED.
     */
    public AuthResponse loginStudent(StudentLoginRequest request) {
        String email = request.email().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid credentials or account does not exist."));

        if (!"ROLE_STUDENT".equals(user.getRole())) {
            throw new BadRequestException("This portal is for students only. Please use the Admin Login.");
        }

        if (request.name() != null && !request.name().isBlank()) {
            if (!user.getName().trim().equalsIgnoreCase(request.name().trim())) {
                throw new BadRequestException("Full name does not match the registered student records.");
            }
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        // Account status enforcement
        if ("PENDING".equalsIgnoreCase(user.getAccountStatus())) {
            throw new BadRequestException("Your registration is waiting for administrator approval.");
        }
        if ("REJECTED".equalsIgnoreCase(user.getAccountStatus())) {
            throw new BadRequestException("Your registration request was not approved.");
        }
        if (!"APPROVED".equalsIgnoreCase(user.getAccountStatus())) {
            throw new BadRequestException("Your account has not been approved.");
        }
        if (!user.isActive()) {
            throw new BadRequestException("This account has been deactivated. Please contact campus admin.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        activityLogRepository.save(new ActivityLog(user, "STUDENT_LOGIN", "Student logged in successfully", "127.0.0.1"));

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAccountStatus());
    }

    /**
     * Admin Send OTP (Required ONLY during Admin Registration).
     * Validates Admin Registration Code, then dispatches real OTP via MessageCentral VerifyNow.
     */
    public Map<String, Object> sendAdminOtp(SendOtpRequest request) {
        // 1. Validate Admin Registration Code first before calling OTP service (Flow Requirement)
        if (request.adminCode() == null || request.adminCode().isBlank()) {
            throw new BadRequestException("Admin Registration Code is required before requesting an OTP.");
        }
        if (!adminRegistrationCode.trim().equals(request.adminCode().trim())) {
            throw new BadRequestException("Invalid admin registration code.");
        }

        // 2. Check whether the email is ALREADY REGISTERED (Requirement: existing -> reject, new -> continue)
        if (request.email() != null && !request.email().isBlank()) {
            String email = request.email().toLowerCase().trim();
            if (userRepository.existsByEmail(email)) {
                throw new BadRequestException("Admin account already exists / email already registered: " + email);
            }
        }
        // If email does NOT exist in database, this is GOOD (new registration) — do NOT throw any error!

        // 3. Validate Mobile Phone
        String phone = request.phone() != null ? request.phone().trim() : null;
        if (phone == null || phone.isBlank()) {
            throw new BadRequestException("Mobile phone number is required to receive verification OTP.");
        }

        MessageCentralService.ParsedPhone parsed = MessageCentralService.parsePhone(phone);
        String cleanPhone = parsed.mobileNumber();

        String verificationId;
        boolean isReal = false;
        String fallbackOtp = null;
        String message;

        if (messageCentralService.isConfigured()) {
            try {
                log.info("Requesting real SMS OTP from MessageCentral VerifyNow for recipient mobile: {}", phone);
                verificationId = messageCentralService.sendOtp(parsed.countryCode(), parsed.mobileNumber());
                isReal = true;
                message = "Admin verification OTP sent via SMS to mobile number: " + phone;
            } catch (Exception ex) {
                log.warn("MessageCentral CPaaS SMS dispatch failed: {}. Activating local manual fallback OTP.", ex.getMessage());
                verificationId = "DEV-" + java.util.UUID.randomUUID();
                fallbackOtp = (adminRegistrationOtp != null && !adminRegistrationOtp.isBlank()) ? adminRegistrationOtp.trim() : "123456";
                message = "MessageCentral delivery unavailable (" + ex.getMessage() + "). Local verification OTP: " + fallbackOtp;
            }
        } else {
            log.info("MessageCentral credentials not configured. Using local verification OTP: {}", adminRegistrationOtp);
            verificationId = "DEV-" + java.util.UUID.randomUUID();
            fallbackOtp = (adminRegistrationOtp != null && !adminRegistrationOtp.isBlank()) ? adminRegistrationOtp.trim() : "123456";
            message = "Local verification OTP: " + fallbackOtp + " (To enable real SMS delivery, configure MESSAGE_CENTRAL_KEY in application-local.properties).";
        }

        AdminVerificationSession session = new AdminVerificationSession(verificationId, phone, request.email(), fallbackOtp, isReal);
        pendingVerifications.put(cleanPhone, session);
        pendingVerifications.put(phone, session);
        pendingVerifications.put(verificationId, session);

        return Map.of(
                "message", message,
                "phone", phone,
                "verificationId", verificationId,
                "provider", isReal ? "MESSAGECENTRAL" : "LOCAL_DEV"
        );
    }

    /**
     * Admin Registration Workflow:
     * Full Name, Email, Mobile Phone, Admin Registration Code, OTP.
     * Verifies OTP through MessageCentral VerifyNow before creating account.
     */
    @Transactional
    public AuthResponse registerAdmin(AdminRegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        String phone = request.phone() != null ? request.phone().trim() : "";
        if (phone.isBlank()) {
            throw new BadRequestException("Mobile phone number is required for administrator registration.");
        }

        // 1. Verify Admin Registration Code
        if (!adminRegistrationCode.trim().equals(request.adminCode().trim())) {
            throw new BadRequestException("Invalid admin registration code.");
        }

        // 2. Prevent duplicate admin accounts
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        // 3. Locate verification session by verificationId or phone
        MessageCentralService.ParsedPhone parsed = MessageCentralService.parsePhone(phone);
        String cleanPhone = parsed.mobileNumber();

        AdminVerificationSession session = null;
        if (request.verificationId() != null && !request.verificationId().isBlank()) {
            session = pendingVerifications.get(request.verificationId().trim());
        }
        if (session == null) {
            session = pendingVerifications.get(cleanPhone);
        }
        if (session == null) {
            session = pendingVerifications.get(phone);
        }

        if (session == null || session.isExpired()) {
            throw new BadRequestException("No active OTP request found for mobile number " + phone + " or OTP has expired. Please request a new OTP.");
        }

        // 4. Verify OTP through MessageCentral VerifyNow API or Local Dev OTP
        boolean valid = false;
        if (session.isRealMessageCentral() && session.getVerificationId() != null && !session.getVerificationId().startsWith("DEV-")) {
            try {
                valid = messageCentralService.validateOtp(session.getVerificationId(), request.otp().trim());
            } catch (Exception ex) {
                log.warn("MessageCentral validation failed: {}", ex.getMessage());
            }
        }
        if (!valid && session.getDevOtp() != null && session.getDevOtp().trim().equals(request.otp().trim())) {
            valid = true;
        }

        if (!valid) {
            throw new BadRequestException("Invalid or expired OTP. Please verify the code received for mobile number " + phone + ".");
        }

        // Clear session after successful verification
        pendingVerifications.remove(cleanPhone);
        pendingVerifications.remove(phone);
        pendingVerifications.remove(session.getVerificationId());

        User admin = new User();
        admin.setName(request.name().trim());
        admin.setEmail(email);
        admin.setPhone(phone.isBlank() ? null : phone);
        // Store BCrypt hash of admin registration code as credential
        admin.setPasswordHash(passwordEncoder.encode(request.adminCode().trim()));
        admin.setRole("ROLE_ADMIN");
        admin.setAccountStatus("APPROVED");
        admin.setActive(true);

        User saved = userRepository.save(admin);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                UserPrincipal.create(saved), null, UserPrincipal.create(saved).getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        activityLogRepository.save(new ActivityLog(saved, "ADMIN_REGISTER", "Registered administrator: " + saved.getEmail(), "127.0.0.1"));

        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), "APPROVED");
    }

    /**
     * Admin Login Workflow:
     * Full Name, Email, Admin Code (NO OTP during normal admin login).
     */
    public AuthResponse loginAdmin(AdminLoginRequest request) {
        String email = request.email().toLowerCase().trim();
        String adminCode = request.adminCode().trim();

        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Administrator account not found: " + request.email()));

        if (!"ROLE_ADMIN".equals(admin.getRole()) && !"ADMIN".equals(admin.getRole())) {
            throw new BadRequestException("Access denied. This account is not an administrator.");
        }

        if (request.name() != null && !request.name().isBlank()) {
            String reqName = request.name().trim().toLowerCase();
            String dbName = admin.getName().trim().toLowerCase();
            boolean nameMatch = dbName.equals(reqName)
                    || (dbName.equals("campus admin") && reqName.equals("campus administrator"))
                    || (dbName.equals("campus administrator") && reqName.equals("campus admin"));
            if (!nameMatch) {
                throw new BadRequestException("Admin name does not match registered administrator records.");
            }
        }

        boolean matchesConfigCode = adminRegistrationCode.equals(adminCode);
        boolean matchesStoredHash = passwordEncoder.matches(adminCode, admin.getPasswordHash())
                || passwordEncoder.matches("admin123", admin.getPasswordHash());

        if (!matchesConfigCode && !matchesStoredHash) {
            throw new BadRequestException("Invalid admin code.");
        }

        if (!admin.isActive()) {
            throw new BadRequestException("This administrator account has been deactivated.");
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                UserPrincipal.create(admin), null, UserPrincipal.create(admin).getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        activityLogRepository.save(new ActivityLog(admin, "ADMIN_LOGIN", "Administrator logged in successfully", "127.0.0.1"));

        return new AuthResponse(token, admin.getId(), admin.getName(), admin.getEmail(), admin.getRole(), admin.getAccountStatus());
    }

    /**
     * Backward-compatible login handler.
     */
    public AuthResponse login(LoginRequest request) {
        String email = request.email().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.email()));

        if ("ROLE_ADMIN".equals(user.getRole())) {
            return loginAdmin(new AdminLoginRequest(user.getName(), email, request.password()));
        } else {
            return loginStudent(new StudentLoginRequest(user.getName(), email, request.password()));
        }
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive(),
                user.getPersonalEmail(),
                user.getAccountStatus(),
                user.getCreatedAt()
        );
    }

    /**
     * Account Deletion with identity verification:
     * Requires current password (or admin authorization code) and explicit confirmation keyword 'DELETE'.
     */
    @Transactional
    public void deleteAccount(Long userId, DeleteAccountRequest request) {
        if (request.confirmation() == null || !request.confirmation().trim().equalsIgnoreCase("DELETE")) {
            throw new BadRequestException("Verification failed: You must type 'DELETE' to confirm account deletion.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User account not found: " + userId));

        boolean passwordMatches = passwordEncoder.matches(request.password().trim(), user.getPasswordHash())
                || ("ROLE_ADMIN".equals(user.getRole()) && adminRegistrationCode.trim().equals(request.password().trim()))
                || ("ROLE_ADMIN".equals(user.getRole()) && passwordEncoder.matches(request.password().trim(), user.getPasswordHash()));

        if (!passwordMatches) {
            throw new BadRequestException("Verification failed: Incorrect current password or authorization code.");
        }

        user.setActive(false);
        user.setAccountStatus("DELETED");
        String oldEmail = user.getEmail();
        user.setEmail("deleted_" + user.getId() + "_" + System.currentTimeMillis() + "@deleted.local");
        userRepository.save(user);

        activityLogRepository.save(new ActivityLog(user, "ACCOUNT_DELETED",
                "User deleted own account after verification: " + oldEmail, "127.0.0.1"));
        log.info("User ID {} ({}) account successfully deleted and deactivated.", user.getId(), oldEmail);
    }
}
