package com.studentmanagement.database;

import java.sql.Connection;
import java.sql.SQLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.studentmanagement.config.DatabaseConfig;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

/**
 * Database connection manager using HikariCP connection pooling
 * This class provides a singleton pattern for managing database connections
 */
public class DatabaseManager {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseManager.class);
    private static DatabaseManager instance;
    private HikariDataSource dataSource;
    
    // Private constructor for singleton pattern
    private DatabaseManager() {
        initializeDataSource();
    }
    
    /**
     * Get singleton instance of DatabaseManager
     * @return DatabaseManager instance
     */
    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }
    
    /**
     * Initialize HikariCP data source with connection pooling configuration
     */
    private void initializeDataSource() {
        try {
            HikariConfig config = new HikariConfig();
            
            // Database connection properties
            config.setJdbcUrl(DatabaseConfig.DB_URL);
            config.setUsername(DatabaseConfig.DB_USERNAME);
            config.setPassword(DatabaseConfig.DB_PASSWORD);
            config.setDriverClassName(DatabaseConfig.DB_DRIVER);
            
            // Connection pool properties
            config.setMaximumPoolSize(DatabaseConfig.MAX_POOL_SIZE);
            config.setMinimumIdle(DatabaseConfig.MIN_POOL_SIZE);
            config.setConnectionTimeout(DatabaseConfig.CONNECTION_TIMEOUT);
            config.setIdleTimeout(DatabaseConfig.IDLE_TIMEOUT);
            config.setMaxLifetime(DatabaseConfig.MAX_LIFETIME);
            
            // Connection pool name for monitoring
            config.setPoolName("StudentManagementPool");
            
            // Additional properties for MySQL
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            config.addDataSourceProperty("useServerPrepStmts", "true");
            config.addDataSourceProperty("rewriteBatchedStatements", "true");
            
            dataSource = new HikariDataSource(config);
            logger.info("Database connection pool initialized successfully");
            
        } catch (Exception e) {
            logger.error("Failed to initialize database connection pool", e);
            throw new RuntimeException("Database initialization failed", e);
        }
    }
    
    /**
     * Get a database connection from the pool
     * @return Connection object
     * @throws SQLException if connection cannot be obtained
     */
    public Connection getConnection() throws SQLException {
        try {
            if (dataSource == null || dataSource.isClosed()) {
                logger.warn("DataSource is null or closed, reinitializing...");
                initializeDataSource();
            }
            return dataSource.getConnection();
        } catch (SQLException e) {
            logger.error("Failed to get database connection", e);
            throw e;
        }
    }
    
    /**
     * Close the data source and release all connections
     */
    public void close() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            logger.info("Database connection pool closed");
        }
    }
    
    /**
     * Check if the data source is healthy
     * @return true if data source is healthy, false otherwise
     */
    public boolean isHealthy() {
        try {
            if (dataSource == null || dataSource.isClosed()) {
                return false;
            }
            
            // Test connection
            try (Connection connection = dataSource.getConnection()) {
                return connection.isValid(5); // 5 second timeout
            }
        } catch (SQLException e) {
            logger.error("Database health check failed", e);
            return false;
        }
    }
    
    /**
     * Get connection pool statistics
     * @return String containing pool statistics
     */
    public String getPoolStats() {
        if (dataSource == null || dataSource.isClosed()) {
            return "DataSource is not available";
        }
        
        return String.format(
            "Pool: %s, Active: %d, Idle: %d, Total: %d, Waiting: %d",
            dataSource.getPoolName(),
            dataSource.getHikariPoolMXBean().getActiveConnections(),
            dataSource.getHikariPoolMXBean().getIdleConnections(),
            dataSource.getHikariPoolMXBean().getTotalConnections(),
            dataSource.getHikariPoolMXBean().getThreadsAwaitingConnection()
        );
    }
}
