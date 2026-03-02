package com.studentmanagement.config;

/**
 * Database configuration class for managing database connection properties
 * Uses environment variables for production (Render), falls back to local
 * config for development
 */
public class DatabaseConfig {

    // Database connection properties (from environment variables with local
    // fallback)
    // Render uses JDBC_DATABASE_URL, DB_URL, or individual vars
    public static final String DB_URL = getDbUrl();
    public static final String DB_USERNAME = getDbUsername();
    public static final String DB_PASSWORD = getDbPassword();

    private static String getDbUrl() {
        // Check Render's JDBC_DATABASE_URL first (if using Render PostgreSQL)
        String jdbcUrl = System.getenv("JDBC_DATABASE_URL");
        if (jdbcUrl != null && !jdbcUrl.isEmpty()) {
            return jdbcUrl;
        }
        // Check custom DB_URL (for external MySQL like Railway, PlanetScale)
        String dbUrl = System.getenv("DB_URL");
        if (dbUrl != null && !dbUrl.isEmpty()) {
            return dbUrl;
        }
        // Local development fallback - H2
        return "jdbc:h2:~/student_management;MODE=MySQL;DB_CLOSE_DELAY=-1";
    }

    private static String getDbUsername() {
        String user = System.getenv("DB_USER");
        if (user != null && !user.isEmpty()) {
            return user;
        }
        return "sa";
    }

    private static String getDbPassword() {
        String pass = System.getenv("DB_PASS");
        if (pass != null && !pass.isEmpty()) {
            return pass;
        }
        return "";
    }

    // Database driver
    public static final String DB_DRIVER = "org.postgresql.Driver";

    // Connection pool properties
    public static final int MAX_POOL_SIZE = 20;
    public static final int MIN_POOL_SIZE = 5;
    public static final long CONNECTION_TIMEOUT = 30000; // 30 seconds
    public static final long IDLE_TIMEOUT = 600000; // 10 minutes
    public static final long MAX_LIFETIME = 1800000; // 30 minutes

    private DatabaseConfig() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }
}
