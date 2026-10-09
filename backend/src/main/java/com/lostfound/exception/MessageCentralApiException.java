package com.lostfound.exception;

public class MessageCentralApiException extends RuntimeException {

    private final int httpStatus;
    private final Integer responseCode;
    private final String responseMessage;
    private final String errorMessage;

    public MessageCentralApiException(int httpStatus, Integer responseCode, String responseMessage, String errorMessage) {
        super(String.format("MessageCentral API error [HTTP: %d, responseCode: %s, message: '%s', error: '%s']",
                httpStatus,
                responseCode != null ? responseCode : "N/A",
                responseMessage != null ? responseMessage : "",
                errorMessage != null ? errorMessage : ""));
        this.httpStatus = httpStatus;
        this.responseCode = responseCode;
        this.responseMessage = responseMessage;
        this.errorMessage = errorMessage;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public Integer getResponseCode() {
        return responseCode;
    }

    public String getResponseMessage() {
        return responseMessage;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
