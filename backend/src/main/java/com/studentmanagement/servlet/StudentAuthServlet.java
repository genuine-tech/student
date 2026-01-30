package com.studentmanagement.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentmanagement.dao.StudentDAO;
import com.studentmanagement.model.Student;
import com.studentmanagement.util.ApiResponse;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/student/auth/*")
public class StudentAuthServlet extends HttpServlet {
    
    private StudentDAO studentDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        studentDAO = new StudentDAO();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        
        if ("/check-registration".equals(pathInfo)) {
            handleCheckRegistration(request, response);
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        
        if ("/login".equals(pathInfo)) {
            handleLogin(request, response);
        } else if ("/register".equals(pathInfo)) {
            handleRegister(request, response);
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }
    
    private void handleCheckRegistration(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            String emailOrRoll = request.getParameter("emailOrRoll");
            
            if (emailOrRoll == null || emailOrRoll.trim().isEmpty()) {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Email or Roll number is required");
                return;
            }
            
            // Get student by email or roll number
            Student student = studentDAO.findByEmailOrRollNumber(emailOrRoll.trim());
            
            if (student == null) {
                ApiResponse.sendError(response, HttpServletResponse.SC_NOT_FOUND, 
                    "Student not found");
                return;
            }
            
            // Check if password is still default
            boolean isRegistered = student.getPassword() != null && 
                                  !student.getPassword().equals("student123");
            
            // Prepare response
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("isRegistered", isRegistered);
            responseData.put("studentId", student.getId());
            responseData.put("name", student.getName());
            responseData.put("email", student.getEmail());
            responseData.put("rollNumber", student.getRollNumber());
            responseData.put("course", student.getCourse());
            
            ApiResponse.sendSuccess(response, responseData, "Registration status checked");
            
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to check registration status: " + e.getMessage());
        }
    }
    
    private void handleLogin(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            // Parse request body
            Map<String, String> credentials = objectMapper.readValue(
                request.getReader(), 
                objectMapper.getTypeFactory().constructMapType(HashMap.class, String.class, String.class)
            );
            
            String emailOrRoll = credentials.get("emailOrRoll");
            String password = credentials.get("password");
            
            if (emailOrRoll == null || emailOrRoll.trim().isEmpty() || 
                password == null || password.trim().isEmpty()) {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Email/Roll number and password are required");
                return;
            }
            
            // Authenticate student
            Student student = studentDAO.studentLogin(emailOrRoll.trim(), password);
            
            if (student != null) {
                // Remove password from response
                student.setPassword(null);
                
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("student", student);
                responseData.put("token", "student-token-" + student.getId()); // Simple token for demo
                
                ApiResponse.sendSuccess(response, responseData, "Login successful");
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, 
                    "Invalid credentials");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Login failed: " + e.getMessage());
        }
    }
    
    private void handleRegister(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            // Parse request body
            Student student = objectMapper.readValue(request.getReader(), Student.class);
            
            // Validate required fields
            if (student.getName() == null || student.getName().trim().isEmpty() ||
                student.getEmail() == null || student.getEmail().trim().isEmpty() ||
                student.getPassword() == null || student.getPassword().trim().isEmpty() ||
                student.getCourse() == null || student.getCourse().trim().isEmpty()) {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Name, email, password, and course are required");
                return;
            }
            
            // Generate roll number if not provided
            if (student.getRollNumber() == null || student.getRollNumber().trim().isEmpty()) {
                // Get count and generate roll number
                int count = studentDAO.getStudentCount() + 1;
                student.setRollNumber(String.format("STU%04d", count));
            }
            
            // Register student
            int studentId = studentDAO.registerStudent(student);
            
            if (studentId > 0) {
                // Fetch the complete student record
                Student registeredStudent = studentDAO.getStudentById(studentId);
                registeredStudent.setPassword(null); // Remove password from response
                
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("student", registeredStudent);
                responseData.put("token", "student-token-" + studentId);
                
                ApiResponse.sendSuccess(response, responseData, "Registration successful");
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Registration failed - email or roll number may already exist");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Registration failed: " + e.getMessage());
        }
    }
}
