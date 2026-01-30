package com.studentmanagement.util;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Standard API response wrapper class
 * This class provides a consistent structure for all API responses
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    private String error;
    private long timestamp;
    
    // Default constructor
    public ApiResponse() {
        this.timestamp = System.currentTimeMillis();
    }
    
    // Constructor for success response
    public ApiResponse(boolean success, String message, T data) {
        this();
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    // Constructor for error response
    public ApiResponse(boolean success, String message, String error) {
        this();
        this.success = success;
        this.message = message;
        this.error = error;
    }
    
    // Static factory methods for common responses
    
    /**
     * Create success response with data
     * @param message Success message
     * @param data Response data
     * @param <T> Type of data
     * @return ApiResponse with success status
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    
    /**
     * Create success response without data
     * @param message Success message
     * @return ApiResponse with success status
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }
    
    /**
     * Create error response
     * @param message Error message
     * @param error Error details
     * @return ApiResponse with error status
     */
    public static <T> ApiResponse<T> error(String message, String error) {
        return new ApiResponse<>(false, message, error);
    }
    
    /**
     * Create error response with simple message
     * @param message Error message
     * @return ApiResponse with error status
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
    
    /**
     * Send success response as JSON
     * @param response HTTP response object
     * @param data Response data
     * @param message Success message
     * @throws IOException if writing response fails
     */
    public static void sendSuccess(HttpServletResponse response, Object data, String message) 
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        
        ApiResponse<Object> apiResponse = ApiResponse.success(message, data);
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        mapper.writeValue(response.getWriter(), apiResponse);
    }
    
    /**
     * Send error response as JSON
     * @param response HTTP response object
     * @param statusCode HTTP status code
     * @param message Error message
     * @throws IOException if writing response fails
     */
    public static void sendError(HttpServletResponse response, int statusCode, String message) 
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        
        ApiResponse<Object> apiResponse = ApiResponse.error(message);
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        mapper.writeValue(response.getWriter(), apiResponse);
    }
    
    // Getters and Setters
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
    
    @Override
    public String toString() {
        return "ApiResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", data=" + data +
                ", error='" + error + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
