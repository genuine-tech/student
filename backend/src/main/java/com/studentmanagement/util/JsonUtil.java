package com.studentmanagement.util;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * Utility class for JSON serialization and deserialization
 * This class provides methods to convert objects to JSON and vice versa
 */
public class JsonUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(JsonUtil.class);
    private static final ObjectMapper objectMapper;
    
    // Private constructor to prevent instantiation
    private JsonUtil() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }
    
    static {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
    }
    
    /**
     * Convert object to JSON string
     * @param obj Object to convert
     * @return JSON string representation
     */
    public static String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (IOException e) {
            logger.error("Failed to convert object to JSON", e);
            return "{}";
        }
    }
    
    /**
     * Convert JSON string to object
     * @param json JSON string
     * @param clazz Target class
     * @param <T> Type of the target class
     * @return Object of the specified type
     * @throws IOException if JSON parsing fails
     */
    public static <T> T fromJson(String json, Class<T> clazz) throws IOException {
        return objectMapper.readValue(json, clazz);
    }
    
    /**
     * Convert JSON string to object (with error handling)
     * @param json JSON string
     * @param clazz Target class
     * @param <T> Type of the target class
     * @return Object of the specified type or null if parsing fails
     */
    public static <T> T fromJsonSafe(String json, Class<T> clazz) {
        try {
            return fromJson(json, clazz);
        } catch (IOException e) {
            logger.error("Failed to parse JSON: {}", json, e);
            return null;
        }
    }
    
    /**
     * Check if string is valid JSON
     * @param json JSON string to validate
     * @return true if valid JSON, false otherwise
     */
    public static boolean isValidJson(String json) {
        try {
            objectMapper.readTree(json);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
    
    /**
     * Get ObjectMapper instance
     * @return ObjectMapper instance
     */
    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
