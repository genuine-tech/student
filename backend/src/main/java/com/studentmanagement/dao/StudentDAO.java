package com.studentmanagement.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.studentmanagement.database.DatabaseManager;
import com.studentmanagement.model.Student;

/**
 * Data Access Object for Student entity
 * This class handles all database operations related to students
 */
public class StudentDAO {
    
    private static final Logger logger = LoggerFactory.getLogger(StudentDAO.class);
    private final DatabaseManager databaseManager;
    
    // SQL queries
    private static final String SELECT_ALL = "SELECT id, name, email, phone, course, gender, dob, city, password, roll_number, created_at, updated_at FROM students ORDER BY created_at DESC";
    private static final String SELECT_BY_ID = "SELECT id, name, email, phone, course, gender, dob, city, password, roll_number, created_at, updated_at FROM students WHERE id = ?";
    private static final String INSERT = "INSERT INTO students (name, email, phone, course, gender, dob, city, password, roll_number, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    private static final String UPDATE = "UPDATE students SET name = ?, email = ?, phone = ?, course = ?, gender = ?, dob = ?, city = ?, password = ?, roll_number = ?, updated_at = ? WHERE id = ?";
    private static final String DELETE = "DELETE FROM students WHERE id = ?";
    private static final String COUNT_ALL = "SELECT COUNT(*) FROM students";
    private static final String SELECT_BY_EMAIL = "SELECT id, name, email, phone, course, created_at, updated_at FROM students WHERE email = ?";
    private static final String STUDENT_LOGIN = "SELECT id, name, email, phone, course, gender, dob, city, roll_number, created_at, updated_at FROM students WHERE (email = ? OR roll_number = ?) AND password = ?";
    private static final String REGISTER_STUDENT = "INSERT INTO students (name, email, phone, course, gender, dob, city, password, roll_number, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    public StudentDAO() {
        this.databaseManager = DatabaseManager.getInstance();
    }
    
    /**
     * Get all students from database
     * @return List of all students
     * @throws SQLException if database operation fails
     */
    public List<Student> getAllStudents() throws SQLException {
        List<Student> students = new ArrayList<>();
        
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            
            while (resultSet.next()) {
                students.add(mapResultSetToStudent(resultSet));
            }
            
            logger.info("Retrieved {} students from database", students.size());
        } catch (SQLException e) {
            logger.error("Failed to retrieve all students", e);
            throw e;
        }
        
        return students;
    }
    
    /**
     * Get student by ID
     * @param id Student ID
     * @return Student object or null if not found
     * @throws SQLException if database operation fails
     */
    public Student getStudentById(int id) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_BY_ID)) {
            
            statement.setInt(1, id);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Student student = mapResultSetToStudent(resultSet);
                    logger.info("Retrieved student with ID: {}", id);
                    return student;
                } else {
                    logger.warn("Student with ID {} not found", id);
                    return null;
                }
            }
        } catch (SQLException e) {
            logger.error("Failed to retrieve student with ID: {}", id, e);
            throw e;
        }
    }
    
    /**
     * Add new student to database
     * @param student Student object to add
     * @return Generated student ID
     * @throws SQLException if database operation fails
     */
    public int addStudent(Student student) throws SQLException {
        if (!student.isValid()) {
            throw new IllegalArgumentException("Invalid student data: " + student.getValidationError());
        }
        
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            statement.setString(1, student.getName());
            statement.setString(2, student.getEmail());
            statement.setString(3, student.getPhone());
            statement.setString(4, student.getCourse());
            statement.setString(5, student.getGender());
            statement.setDate(6, student.getDob() != null ? java.sql.Date.valueOf(student.getDob()) : null);
            statement.setString(7, student.getCity());
            statement.setString(8, student.getPassword());
            statement.setString(9, student.getRollNumber());
            statement.setTimestamp(10, Timestamp.valueOf(now));
            statement.setTimestamp(11, Timestamp.valueOf(now));
            
            int affectedRows = statement.executeUpdate();
            
            if (affectedRows == 0) {
                throw new SQLException("Creating student failed, no rows affected.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int id = generatedKeys.getInt(1);
                    student.setId(id);
                    student.setCreatedAt(now);
                    student.setUpdatedAt(now);
                    logger.info("Added new student with ID: {}", id);
                    return id;
                } else {
                    throw new SQLException("Creating student failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            logger.error("Failed to add student", e);
            throw e;
        }
    }
    
    /**
     * Update existing student
     * @param student Student object with updated data
     * @return true if update was successful, false otherwise
     * @throws SQLException if database operation fails
     */
    public boolean updateStudent(Student student) throws SQLException {
        if (!student.isValid()) {
            throw new IllegalArgumentException("Invalid student data: " + student.getValidationError());
        }
        
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE)) {
            
            LocalDateTime now = LocalDateTime.now();
            statement.setString(1, student.getName());
            statement.setString(2, student.getEmail());
            statement.setString(3, student.getPhone());
            statement.setString(4, student.getCourse());
            statement.setString(5, student.getGender());
            if (student.getDob() != null) {
                statement.setDate(6, java.sql.Date.valueOf(student.getDob()));
            } else {
                statement.setNull(6, java.sql.Types.DATE);
            }
            statement.setString(7, student.getCity());
            statement.setString(8, student.getPassword());
            statement.setString(9, student.getRollNumber());
            statement.setTimestamp(10, Timestamp.valueOf(now));
            statement.setInt(11, student.getId());
            
            int affectedRows = statement.executeUpdate();
            boolean success = affectedRows > 0;
            
            if (success) {
                student.setUpdatedAt(now);
                logger.info("Updated student with ID: {}", student.getId());
            } else {
                logger.warn("No student found with ID: {} for update", student.getId());
            }
            
            return success;
        } catch (SQLException e) {
            logger.error("Failed to update student with ID: {}", student.getId(), e);
            throw e;
        }
    }
    
    /**
     * Delete student by ID
     * @param id Student ID to delete
     * @return true if deletion was successful, false otherwise
     * @throws SQLException if database operation fails
     */
    public boolean deleteStudent(int id) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE)) {
            
            statement.setInt(1, id);
            int affectedRows = statement.executeUpdate();
            boolean success = affectedRows > 0;
            
            if (success) {
                logger.info("Deleted student with ID: {}", id);
            } else {
                logger.warn("No student found with ID: {} for deletion", id);
            }
            
            return success;
        } catch (SQLException e) {
            logger.error("Failed to delete student with ID: {}", id, e);
            throw e;
        }
    }
    
    /**
     * Get total count of students
     * @return Total number of students
     * @throws SQLException if database operation fails
     */
    public int getTotalStudents() throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            
            if (resultSet.next()) {
                int count = resultSet.getInt(1);
                logger.info("Total students count: {}", count);
                return count;
            }
            
            return 0;
        } catch (SQLException e) {
            logger.error("Failed to get total students count", e);
            throw e;
        }
    }
    
        /**
     * Get total count of students
     * @return Total number of students
     * @throws SQLException if database operation fails
     */
    public int getStudentCount() throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_ALL);
             ResultSet resultSet = statement.executeQuery()) {
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
            return 0;
        } catch (SQLException e) {
            logger.error("Failed to get student count", e);
            throw e;
        }
    }
    
    /**
     * Check if email already exists (excluding specific ID)
     * @param email Email to check
     * @param excludeId ID to exclude from check (for updates)
     * @return true if email exists, false otherwise
     * @throws SQLException if database operation fails
     */
    public boolean emailExists(String email, int excludeId) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_BY_EMAIL)) {
            
            statement.setString(1, email);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    if (resultSet.getInt("id") != excludeId) {
                        return true;
                    }
                }
            }
            
            return false;
        } catch (SQLException e) {
            logger.error("Failed to check email existence: {}", email, e);
            throw e;
        }
    }
    
    /**
     * Find student by email or roll number (without password check)
     * @param emailOrRoll Email or roll number
     * @return Student object if found, null otherwise
     * @throws SQLException if database operation fails
     */
    public Student findByEmailOrRollNumber(String emailOrRoll) throws SQLException {
        String query = "SELECT id, name, email, phone, course, gender, dob, city, password, roll_number, created_at, updated_at FROM students WHERE email = ? OR roll_number = ?";
        
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setString(1, emailOrRoll);
            statement.setString(2, emailOrRoll);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return mapResultSetToStudent(resultSet);
                }
            }
            
            return null;
        } catch (SQLException e) {
            logger.error("Failed to find student by email or roll: {}", emailOrRoll, e);
            throw e;
        }
    }
    
    /**
     * Student login - authenticate with email/roll number and password
     * @param emailOrRoll Email or roll number
     * @param password Password
     * @return Student object if authentication successful, null otherwise
     * @throws SQLException if database operation fails
     */
    public Student studentLogin(String emailOrRoll, String password) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(STUDENT_LOGIN)) {
            
            statement.setString(1, emailOrRoll);
            statement.setString(2, emailOrRoll);
            statement.setString(3, password);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return mapResultSetToStudent(resultSet);
                }
            }
            
            return null;
        } catch (SQLException e) {
            logger.error("Student login failed for: {}", emailOrRoll, e);
            throw e;
        }
    }
    
    /**
     * Register new student
     * @param student Student object with registration details
     * @return Generated student ID if successful, -1 otherwise
     * @throws SQLException if database operation fails
     */
    public int registerStudent(Student student) throws SQLException {
        try (Connection connection = databaseManager.getConnection();
             PreparedStatement statement = connection.prepareStatement(REGISTER_STUDENT, Statement.RETURN_GENERATED_KEYS)) {
            
            statement.setString(1, student.getName());
            statement.setString(2, student.getEmail());
            statement.setString(3, student.getPhone());
            statement.setString(4, student.getCourse());
            statement.setString(5, student.getGender());
            statement.setDate(6, student.getDob() != null ? java.sql.Date.valueOf(student.getDob()) : null);
            statement.setString(7, student.getCity());
            statement.setString(8, student.getPassword());
            statement.setString(9, student.getRollNumber());
            statement.setTimestamp(10, Timestamp.valueOf(LocalDateTime.now()));
            statement.setTimestamp(11, Timestamp.valueOf(LocalDateTime.now()));
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        return generatedKeys.getInt(1);
                    }
                }
            }
            
            return -1;
        } catch (SQLException e) {
            logger.error("Failed to register student: {}", student.getEmail(), e);
            throw e;
        }
    }
    
    /**
     * Map ResultSet to Student object
     * @param resultSet ResultSet from database query
     * @return Student object
     * @throws SQLException if mapping fails
     */
    private Student mapResultSetToStudent(ResultSet resultSet) throws SQLException {
        Student student = new Student();
        student.setId(resultSet.getInt("id"));
        student.setName(resultSet.getString("name"));
        student.setEmail(resultSet.getString("email"));
        student.setPhone(resultSet.getString("phone"));
        student.setCourse(resultSet.getString("course"));
        student.setGender(resultSet.getString("gender"));
        java.sql.Date dob = resultSet.getDate("dob");
        if (dob != null) {
            student.setDob(dob.toLocalDate());
        }
        student.setCity(resultSet.getString("city"));
        
        // Handle password and roll_number safely
        try {
            student.setPassword(resultSet.getString("password"));
            student.setRollNumber(resultSet.getString("roll_number"));
        } catch (SQLException e) {
            // Columns might not exist in some queries, that's okay
        }
        
        Timestamp createdAt = resultSet.getTimestamp("created_at");
        if (createdAt != null) {
            student.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = resultSet.getTimestamp("updated_at");
        if (updatedAt != null) {
            student.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return student;
    }
}
