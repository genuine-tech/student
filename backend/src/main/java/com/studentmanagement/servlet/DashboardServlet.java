package com.studentmanagement.servlet;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.studentmanagement.dao.StudentDAO;
import com.studentmanagement.util.ApiResponse;
import com.studentmanagement.util.JsonUtil;

/**
 * Dashboard Servlet providing statistics and overview data
 * This servlet handles dashboard-related API endpoints
 */
@WebServlet("/api/dashboard/*")
public class DashboardServlet extends HttpServlet {
    
    private static final Logger logger = LoggerFactory.getLogger(DashboardServlet.class);
    private final StudentDAO studentDAO;
    
    public DashboardServlet() {
        this.studentDAO = new StudentDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try {
            if (pathInfo == null || pathInfo.equals("/") || pathInfo.equals("/stats")) {
                // GET /api/dashboard/stats - Get dashboard statistics
                handleGetStats(response);
            } else {
                // Handle other dashboard endpoints if needed
                sendErrorResponse(response, "Endpoint not found", HttpServletResponse.SC_NOT_FOUND);
            }

        } catch (Exception e) {
            // Log error for easier debugging
            logger.error("Error in GET request", e);
            sendErrorResponse(response, "Internal server error", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Handle GET request for dashboard statistics
     */
    private void handleGetStats(HttpServletResponse response) throws SQLException {
        
        // Get total students count
        int totalStudents = studentDAO.getTotalStudents();
        
        // Get total courses count (for now, we'll use a fixed number)
        // In a real application, you might have a separate courses table
        int totalCourses = 8; // Total available courses in the system
        
        // Get all students to extract recent students
        List<com.studentmanagement.model.Student> allStudents = studentDAO.getAllStudents();
        
        // Get recent students (last 5)
        List<Map<String, Object>> recentStudentsList = new java.util.ArrayList<>();
        int limit = Math.min(5, allStudents.size());
        for (int i = 0; i < limit; i++) {
            com.studentmanagement.model.Student student = allStudents.get(i);
            Map<String, Object> studentMap = new HashMap<>();
            studentMap.put("id", student.getId());
            studentMap.put("name", student.getName());
            studentMap.put("course", student.getCourse());
            studentMap.put("email", student.getEmail());
            recentStudentsList.add(studentMap);
        }
        
        // Create statistics map
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalCourses", totalCourses);
        stats.put("recentStudents", recentStudentsList); // Array of recent students
        stats.put("activeStudents", totalStudents); // For now, same as total
        
        // Add additional statistics
        Map<String, Object> additionalStats = new HashMap<>();
        additionalStats.put("studentsThisMonth", totalStudents);
        additionalStats.put("averageStudentsPerCourse", totalStudents > 0 ? totalStudents / totalCourses : 0);
        additionalStats.put("systemHealth", "Good");
        
        stats.put("additionalStats", additionalStats);
        
        try {
            // Create response using helper to ensure correct headers
            ApiResponse.sendSuccess(response, stats, "Dashboard statistics retrieved successfully");
            logger.info("Dashboard statistics retrieved - Total Students: {}, Total Courses: {}", 
                totalStudents, totalCourses);
        } catch (IOException e) {
            logger.error("Failed to write dashboard response", e);
            try {
                ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to write response");
            } catch (IOException ex) {
                logger.error("Failed to send error response", ex);
            }
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
