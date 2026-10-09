package com.lostfound.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.exception.BadRequestException;
import com.lostfound.exception.MessageCentralApiException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Properties;

/**
 * MessageCentral CPaaS VerifyNow SMS OTP Service.
 * Implements real SMS OTP dispatch and validation for Administrator Registration.
 *
 * Unified environment variable & property mappings:
 *   - MESSAGE_CENTRAL_CUSTOMER_ID (Default: C-C0D85763CDFC41C)
 *   - MESSAGE_CENTRAL_EMAIL
 *   - MESSAGE_CENTRAL_KEY (secret key / password, Base64 encoded for token API)
 */
@Service
public class MessageCentralService {

    private static final Logger log = LoggerFactory.getLogger(MessageCentralService.class);

    @Value("${messagecentral.customer-id:C-C0D85763CDFC41C}")
    private String customerId;

    @Value("${messagecentral.email:}")
    private String email;

    @Value("${messagecentral.key:}")
    private String key;

    @Value("${messagecentral.base-url:https://cpaas.messagecentral.com}")
    private String baseUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private String cachedToken = null;
    private long tokenExpiryTimestamp = 0;

    public MessageCentralService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @PostConstruct
    public void init() {
        loadLocalConfigFallback();
        // Log configuration status WITHOUT printing secret values
        log.info("MessageCentral Configuration Status: CustomerId={}, Email={}, Key={}",
                (getCustomerId() != null && !getCustomerId().isBlank()) ? "DETECTED" : "MISSING",
                (getEmail() != null && !getEmail().isBlank()) ? "DETECTED" : "MISSING",
                (getKey() != null && !getKey().isBlank()) ? "DETECTED" : "MISSING");
    }

    /**
     * Fallback loader that checks local secrets configuration files (.env, application-local.properties)
     * so that developers do not need to manually set PowerShell environment variables each time.
     */
    private void loadLocalConfigFallback() {
        String[] candidatePaths = {
                "application-local.properties",
                "backend/application-local.properties",
                "../application-local.properties",
                ".env",
                "backend/.env",
                "../.env"
        };

        for (String path : candidatePaths) {
            File file = new File(path);
            if (file.exists() && file.isFile()) {
                try (FileInputStream fis = new FileInputStream(file)) {
                    Properties props = new Properties();
                    props.load(fis);
                    if (this.customerId == null || this.customerId.isBlank() || "C-C0D85763CDFC41C".equals(this.customerId)) {
                        String val = props.getProperty("MESSAGE_CENTRAL_CUSTOMER_ID", props.getProperty("messagecentral.customer-id"));
                        if (val != null && !val.isBlank()) this.customerId = val.trim();
                    }
                    if (this.email == null || this.email.isBlank()) {
                        String val = props.getProperty("MESSAGE_CENTRAL_EMAIL", props.getProperty("messagecentral.email"));
                        if (val != null && !val.isBlank()) this.email = val.trim();
                    }
                    if (this.key == null || this.key.isBlank()) {
                        String val = props.getProperty("MESSAGE_CENTRAL_KEY", props.getProperty("messagecentral.key"));
                        if (val != null && !val.isBlank()) this.key = val.trim();
                    }
                } catch (Exception ignored) {}
            }
        }

        // Fallback to System environment variables
        if (this.email == null || this.email.isBlank()) {
            String envEmail = System.getenv("MESSAGE_CENTRAL_EMAIL");
            if (envEmail != null && !envEmail.isBlank()) this.email = envEmail.trim();
        }
        if (this.key == null || this.key.isBlank()) {
            String envKey = System.getenv("MESSAGE_CENTRAL_KEY");
            if (envKey != null && !envKey.isBlank()) this.key = envKey.trim();
        }
        if (this.customerId == null || this.customerId.isBlank() || "C-C0D85763CDFC41C".equals(this.customerId)) {
            String envCId = System.getenv("MESSAGE_CENTRAL_CUSTOMER_ID");
            if (envCId != null && !envCId.isBlank()) this.customerId = envCId.trim();
        }
    }

    public String getCustomerId() {
        if (customerId != null && !customerId.isBlank()) return customerId.trim();
        return "C-C0D85763CDFC41C";
    }

    public String getEmail() {
        if (email != null && !email.isBlank()) return email.trim();
        return null;
    }

    public String getKey() {
        if (key != null && !key.isBlank()) return key.trim();
        return null;
    }

    public String getBaseUrl() {
        String url = (baseUrl != null && !baseUrl.isBlank()) ? baseUrl : "https://cpaas.messagecentral.com";
        return cleanBaseUrl(url);
    }

    /**
     * Checks if the required MessageCentral credentials are provided.
     * customerId and key are the essential credentials required by MessageCentral CPaaS.
     */
    public boolean isConfigured() {
        String cId = getCustomerId();
        String k = getKey();
        return cId != null && !cId.isBlank()
                && k != null && !k.isBlank()
                && !"YOUR_MESSAGECENTRAL_KEY".equalsIgnoreCase(k);
    }

    /**
     * STEP 1 — GENERATE AUTH TOKEN
     * GET /auth/v1/authentication/token
     * Query parameters:
     *   customerId = MESSAGE_CENTRAL_CUSTOMER_ID
     *   key = Base64 encoded MESSAGE_CENTRAL_KEY
     *   scope = NEW
     *   country = 91
     *   email = MESSAGE_CENTRAL_EMAIL (optional, only included if valid and non-placeholder)
     */
    public synchronized String getAuthToken() {
        if (cachedToken != null && System.currentTimeMillis() < tokenExpiryTimestamp) {
            return cachedToken;
        }

        String secretKey = getKey();
        if (secretKey == null || secretKey.isBlank() || "YOUR_MESSAGECENTRAL_KEY".equalsIgnoreCase(secretKey)) {
            throw new MessageCentralApiException(0, null, "Missing Credentials", "MESSAGE_CENTRAL_KEY is not configured in environment or local secrets.");
        }
        String userEmail = getEmail();
        String userCustomerId = getCustomerId();

        try {
            // Secret key must be Base64 encoded before being sent to the token API
            String base64Key = Base64.getEncoder().encodeToString(secretKey.getBytes(StandardCharsets.UTF_8));
            String normalizedBase = getBaseUrl();
            StringBuilder urlBuilder = new StringBuilder();
            urlBuilder.append(normalizedBase)
                    .append("/auth/v1/authentication/token?customerId=")
                    .append(URLEncoder.encode(userCustomerId, StandardCharsets.UTF_8))
                    .append("&key=")
                    .append(URLEncoder.encode(base64Key, StandardCharsets.UTF_8))
                    .append("&scope=NEW&country=91");

            // Only append email parameter if a valid, registered CPaaS account email is configured (NOT a placeholder or missing)
            if (userEmail != null && !userEmail.isBlank()
                    && !userEmail.equalsIgnoreCase("YOUR_EMAIL")
                    && !userEmail.toLowerCase().contains("your_email")
                    && userEmail.contains("@")) {
                urlBuilder.append("&email=").append(URLEncoder.encode(userEmail, StandardCharsets.UTF_8));
            }
            String url = urlBuilder.toString();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("accept", "*/*")
                    .GET()
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int httpStatus = response.statusCode();
            String responseBody = response.body();

            JsonNode root = null;
            try {
                root = objectMapper.readTree(responseBody);
            } catch (Exception ignored) {}

            int statusCode = (root != null && root.has("status")) ? root.get("status").asInt()
                    : ((root != null && root.has("responseCode")) ? root.get("responseCode").asInt() : httpStatus);

            if (httpStatus != 200 || statusCode != 200) {
                String message = root != null && root.has("message") ? root.get("message").asText() : "";
                String errorMsg = root != null && root.has("error") ? root.get("error").asText()
                        : (root != null && root.has("errorMessage") ? root.get("errorMessage").asText() : responseBody);
                log.error("MessageCentral token generation failed with HTTP status {}, statusCode {}", httpStatus, statusCode);

                // Ensure CPaaS API error messages never look like local database user lookup errors
                if (errorMsg != null && errorMsg.toLowerCase().contains("email is not found in database")) {
                    errorMsg = "MessageCentral CPaaS account error: registered CPaaS account email not recognized on MessageCentral. Please verify your MessageCentral credentials.";
                } else if (errorMsg != null && (errorMsg.toLowerCase().contains("password is wrong") || errorMsg.toLowerCase().contains("wrong password"))) {
                    errorMsg = "MessageCentral CPaaS authentication failed: invalid customer key/password. Please verify your MessageCentral credentials.";
                }
                throw new MessageCentralApiException(httpStatus, statusCode, message, errorMsg);
            }

            String token = null;
            if (root != null) {
                if (root.has("token") && !root.get("token").isNull()) {
                    token = root.get("token").asText();
                } else if (root.path("data").has("token")) {
                    token = root.path("data").get("token").asText();
                }
            }

            if (token == null || token.isBlank()) {
                throw new MessageCentralApiException(httpStatus, statusCode, "Empty Token", "MessageCentral returned empty authentication token.");
            }

            this.cachedToken = token;
            // Cache token for 50 minutes (tokens are valid for 1 hour)
            this.tokenExpiryTimestamp = System.currentTimeMillis() + (50L * 60 * 1000);
            return token;

        } catch (MessageCentralApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Exception connecting to MessageCentral auth service: {}", e.getMessage());
            throw new MessageCentralApiException(0, null, "Connection Error", e.getMessage());
        }
    }

    /**
     * STEP 2 — SEND OTP
     * POST /verification/v3/send
     * Query parameters:
     *   countryCode=91
     *   flowType=SMS
     *   mobileNumber=<10 digit Indian mobile number>
     * Header:
     *   authToken: <generated token>
     * Returns: verificationId
     */
    public String sendOtp(String countryCode, String mobileNumber) {
        String token = getAuthToken();
        String cId = getCustomerId();
        String cleanCc = (countryCode != null && !countryCode.isBlank()) ? countryCode : "91";

        try {
            String normalizedBase = getBaseUrl();
            String url = String.format("%s/verification/v3/send?countryCode=%s&customerId=%s&flowType=SMS&mobileNumber=%s",
                    normalizedBase,
                    URLEncoder.encode(cleanCc, StandardCharsets.UTF_8),
                    URLEncoder.encode(cId, StandardCharsets.UTF_8),
                    URLEncoder.encode(mobileNumber, StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("authToken", token)
                    .header("customerId", cId)
                    .header("accept", "*/*")
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int httpStatus = response.statusCode();
            String responseBody = response.body();

            // If token expired (HTTP 401), invalidate cache and retry once
            if (httpStatus == 401) {
                this.cachedToken = null;
                token = getAuthToken();
                request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("authToken", token)
                        .header("customerId", cId)
                        .header("accept", "*/*")
                        .POST(HttpRequest.BodyPublishers.noBody())
                        .timeout(Duration.ofSeconds(15))
                        .build();
                response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                httpStatus = response.statusCode();
                responseBody = response.body();
            }

            JsonNode root = null;
            try {
                root = objectMapper.readTree(responseBody);
            } catch (Exception ignored) {}

            int responseCode = root != null && root.has("responseCode") ? root.get("responseCode").asInt()
                    : (root != null && root.has("status") ? root.get("status").asInt() : httpStatus);
            String message = root != null && root.has("message") ? root.get("message").asText() : "";
            String errorMessage = root != null && root.has("errorMessage") ? root.get("errorMessage").asText()
                    : (root != null && root.has("error") ? root.get("error").asText() : "");

            if (httpStatus != 200 || responseCode != 200) {
                log.error("MessageCentral send OTP returned HTTP status {}, responseCode {}", httpStatus, responseCode);
                throw new MessageCentralApiException(httpStatus, responseCode, message, errorMessage.isBlank() ? responseBody : errorMessage);
            }

            String verificationId = null;
            if (root != null) {
                if (root.path("data").has("verificationId")) {
                    verificationId = root.path("data").get("verificationId").asText();
                } else if (root.has("verificationId")) {
                    verificationId = root.get("verificationId").asText();
                }
            }

            if (verificationId == null || verificationId.isBlank()) {
                throw new MessageCentralApiException(httpStatus, responseCode, message, "verificationId missing in MessageCentral response data.");
            }

            log.info("MessageCentral OTP sent successfully. Verification ID generated.");
            return verificationId;

        } catch (MessageCentralApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Exception during MessageCentral send OTP: {}", e.getMessage());
            throw new MessageCentralApiException(0, null, "Dispatch Error", e.getMessage());
        }
    }

    /**
     * STEP 3 — VERIFY OTP
     * GET /verification/v3/validateOtp/
     * Query parameters:
     *   verificationId=<verificationId>
     *   code=<OTP entered by admin>
     * Header:
     *   authToken: <generated token>
     * Returns true if MessageCentral validates successfully.
     */
    public boolean validateOtp(String verificationId, String code) {
        if (verificationId == null || verificationId.isBlank() || code == null || code.isBlank()) {
            return false;
        }

        String token = getAuthToken();
        try {
            String normalizedBase = getBaseUrl();
            String url = String.format("%s/verification/v3/validateOtp/?verificationId=%s&code=%s",
                    normalizedBase,
                    URLEncoder.encode(verificationId.trim(), StandardCharsets.UTF_8),
                    URLEncoder.encode(code.trim(), StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("authToken", token)
                    .header("accept", "*/*")
                    .GET()
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 401) {
                this.cachedToken = null;
                token = getAuthToken();
                request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("authToken", token)
                        .header("accept", "*/*")
                        .GET()
                        .timeout(Duration.ofSeconds(15))
                        .build();
                response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            }

            if (response.statusCode() != 200) {
                log.warn("MessageCentral validate OTP returned HTTP status {}", response.statusCode());
                return false;
            }

            JsonNode root = objectMapper.readTree(response.body());
            int responseCode = root.path("responseCode").asInt(root.path("status").asInt(200));
            String status = root.path("data").path("verificationStatus").asText();
            String message = root.path("message").asText();

            if ("VERIFICATION_COMPLETED".equalsIgnoreCase(status) || (responseCode == 200 && "SUCCESS".equalsIgnoreCase(message))) {
                return true;
            }

            log.warn("MessageCentral OTP validation failed with status: {}, responseCode: {}", status, responseCode);
            return false;

        } catch (Exception e) {
            log.error("Exception validating OTP with MessageCentral: {}", e.getMessage());
            return false;
        }
    }

    private String cleanBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "https://cpaas.messagecentral.com";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    /**
     * Helper record to split phone number into countryCode and mobileNumber.
     */
    public record ParsedPhone(String countryCode, String mobileNumber) {}

    public static ParsedPhone parsePhone(String raw) {
        if (raw == null) {
            return new ParsedPhone("91", "");
        }
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            return new ParsedPhone("91", digits);
        } else if (digits.length() == 12 && digits.startsWith("91")) {
            return new ParsedPhone("91", digits.substring(2));
        } else if (digits.length() > 10) {
            String mob = digits.substring(digits.length() - 10);
            String cc = digits.substring(0, digits.length() - 10);
            return new ParsedPhone(cc, mob);
        }
        return new ParsedPhone("91", digits);
    }
}
