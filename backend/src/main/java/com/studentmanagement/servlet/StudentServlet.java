package com.studentmanagement.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.studentmanagement.dao.StudentDAO;
import com.studentmanagement.model.Student;
import com.studentmanagement.util.ApiResponse;
import com.studentmanagement.util.JsonUtil;

/**
 * Student Servlet handling all student-related REST API endpoints
 * Supports GET, POST, PUT, DELETE operations for student management
 */
@WebServlet("/api/students/*")
public class StudentServlet extends HttpServlet {
    
    private static final Logger logger = LoggerFactory.getLogger(StudentServlet.class);
    private static final String CONTENT_TYPE_JSON = "application/json";
    private static final String CHARSET_UTF8 = "UTF-8";
    private static final String ERROR_STUDENT_NOT_FOUND = "Student not found";
    private static final String ERROR_INVALID_STUDENT_ID = "Invalid student ID";
    private static final String ERROR_INTERNAL_SERVER = "Internal server error";
    
    private final StudentDAO studentDAO;
    
    public StudentServlet() {
        this.studentDAO = new StudentDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        response.setContentType(CONTENT_TYPE_JSON);
        response.setCharacterEncoding(CHARSET_UTF8);
        
        try (PrintWriter out = response.getWriter()) {
            
            if (pathInfo == null || pathInfo.equals("/")) {
                // GET /api/students - Get all students
                handleGetAllStudents(response, out);
            } else {
                // GET /api/students/{id} - Get student by ID
                String idParam = pathInfo.substring(1); // Remove leading slash
                handleGetStudentById(idParam, response, out);
            }
            
        } catch (Exception e) {
            logger.error("Error in GET request", e);
            try {
                sendErrorResponse(response, ERROR_INTERNAL_SERVER, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            } catch (IOException ioException) {
                logger.error("Failed to send error response", ioException);
            }
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType(CONTENT_TYPE_JSON);
        response.setCharacterEncoding(CHARSET_UTF8);
        
        try {
            // Read request body
            StringBuilder jsonBuilder = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                jsonBuilder.append(line);
            }
            
            String jsonData = jsonBuilder.toString();
            logger.info("Received POST request with data: {}", jsonData);
            
            // Parse JSON to Student object
            Student student = JsonUtil.fromJson(jsonData, Student.class);
            
            if (student == null) {
                sendErrorResponse(response, "Invalid JSON data", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            
            // Validate student data
            if (!student.isValid()) {
                sendErrorResponse(response, "Invalid student data: " + student.getValidationError(), 
                    HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            
            // Check if email already exists
            if (studentDAO.emailExists(student.getEmail(), 0)) {
                sendErrorResponse(response, "Email already exists", HttpServletResponse.SC_CONFLICT);
                return;
            }
            
            // Add student to database
            int studentId = studentDAO.addStudent(student);
            student.setId(studentId);
            
            // Send success response
            ApiResponse<Student> apiResponse = ApiResponse.success("Student added successfully", student);
            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write(JsonUtil.toJson(apiResponse));
            
            logger.info("Student added successfully with ID: {}", studentId);
            
        } catch (IOException | SQLException | IllegalArgumentException e) {
            logger.error("Error in POST request", e);
            try {
                sendErrorResponse(response, "Failed to add student", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            } catch (IOException ioException) {
                logger.error("Failed to send error response", ioException);
            }
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        response.setContentType(CONTENT_TYPE_JSON);
        response.setCharacterEncoding(CHARSET_UTF8);
        
        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(response, "Student ID required for update", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        try {
            // Extract student ID from path
            String idParam = pathInfo.substring(1); // Remove leading slash
            int studentId = Integer.parseInt(idParam);
            
            // Read request body
            StringBuilder jsonBuilder = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                jsonBuilder.append(line);
            }
            
            String jsonData = jsonBuilder.toString();
            logger.info("Received PUT request for ID {} with data: {}", studentId, jsonData);
            
            // Parse JSON to Student object
            Student student = JsonUtil.fromJson(jsonData, Student.class);
            
            if (student == null) {
                sendErrorResponse(response, "Invalid JSON data", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            
            // Set the ID from URL parameter
            student.setId(studentId);
            
            // Validate student data
            if (!student.isValid()) {
                sendErrorResponse(response, "Invalid student data: " + student.getValidationError(), 
                    HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            
            // Check if email already exists (excluding current student)
            if (studentDAO.emailExists(student.getEmail(), studentId)) {
                sendErrorResponse(response, "Email already exists", HttpServletResponse.SC_CONFLICT);
                return;
            }
            
            // Update student in database
            boolean updated = studentDAO.updateStudent(student);
            
            if (updated) {
                // Send success response
                ApiResponse<Student> apiResponse = ApiResponse.success("Student updated successfully", student);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write(JsonUtil.toJson(apiResponse));
                
                logger.info("Student updated successfully with ID: {}", studentId);
            } else {
                sendErrorResponse(response, ERROR_STUDENT_NOT_FOUND, HttpServletResponse.SC_NOT_FOUND);
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, ERROR_INVALID_STUDENT_ID, HttpServletResponse.SC_BAD_REQUEST);
        } catch (IOException | SQLException e) {
            logger.error("Error in PUT request", e);
            sendErrorResponse(response, "Failed to update student", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        response.setContentType(CONTENT_TYPE_JSON);
        response.setCharacterEncoding(CHARSET_UTF8);
        
        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(response, "Student ID required for deletion", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        try {
            // Extract student ID from path
            String idParam = pathInfo.substring(1); // Remove leading slash
            int studentId = Integer.parseInt(idParam);
            
            logger.info("Received DELETE request for ID: {}", studentId);
            
            // Delete student from database
            boolean deleted = studentDAO.deleteStudent(studentId);
            
            if (deleted) {
                // Send success response
                ApiResponse<String> apiResponse = ApiResponse.success("Student deleted successfully", null);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write(JsonUtil.toJson(apiResponse));
                
                logger.info("Student deleted successfully with ID: {}", studentId);
            } else {
                sendErrorResponse(response, ERROR_STUDENT_NOT_FOUND, HttpServletResponse.SC_NOT_FOUND);
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, ERROR_INVALID_STUDENT_ID, HttpServletResponse.SC_BAD_REQUEST);
        } catch (IOException | SQLException e) {
            logger.error("Error in DELETE request", e);
            sendErrorResponse(response, "Failed to delete student", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Handle GET request for all students
     */
    private void handleGetAllStudents(HttpServletResponse response, PrintWriter out) throws SQLException {
        List<Student> students = studentDAO.getAllStudents();
        
        // Remove passwords from response for security
        for (Student student : students) {
            student.setPassword(null);
        }
        
        ApiResponse<List<Student>> apiResponse = ApiResponse.success("Students retrieved successfully", students);
        response.setStatus(HttpServletResponse.SC_OK);
        out.write(JsonUtil.toJson(apiResponse));
        logger.info("Retrieved {} students", students.size());
    }
    
    /**
     * Handle GET request for student by ID
     */
    private void handleGetStudentById(String idParam, HttpServletResponse response, PrintWriter out) 
            throws SQLException, IOException {
        
        try {
            int studentId = Integer.parseInt(idParam);
            Student student = studentDAO.getStudentById(studentId);
            
            if (student != null) {
                // Remove password from response for security
                student.setPassword(null);
                
                ApiResponse<Student> apiResponse = ApiResponse.success("Student retrieved successfully", student);
                response.setStatus(HttpServletResponse.SC_OK);
                out.write(JsonUtil.toJson(apiResponse));
                logger.info("Retrieved student with ID: {}", studentId);
            } else {
                sendErrorResponse(response, ERROR_STUDENT_NOT_FOUND, HttpServletResponse.SC_NOT_FOUND);
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, ERROR_INVALID_STUDENT_ID, HttpServletResponse.SC_BAD_REQUEST);
        }
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, String message, int statusCode) 
            throws IOException {
        
        ApiResponse<String> apiResponse = ApiResponse.error(message);
        response.setStatus(statusCode);
        response.getWriter().write(JsonUtil.toJson(apiResponse));
        logger.warn("Error response sent: {} - {}", statusCode, message);
    }
}
