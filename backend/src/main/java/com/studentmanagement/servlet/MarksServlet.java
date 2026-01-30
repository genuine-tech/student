package com.studentmanagement.servlet;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentmanagement.dao.MarksDAO;
import com.studentmanagement.model.Marks;
import com.studentmanagement.util.ApiResponse;

@WebServlet("/api/marks/*")
public class MarksServlet extends HttpServlet {
    
    private MarksDAO marksDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        marksDAO = new MarksDAO();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        
        try {
            if (pathInfo == null || "/".equals(pathInfo)) {
                // Get all marks (for admin)
                List<Marks> marks = marksDAO.getAllMarks();
                ApiResponse.sendSuccess(response, marks, "Marks retrieved successfully");
                
            } else if (pathInfo.startsWith("/student/")) {
                // Get marks for specific student
                int studentId = Integer.parseInt(pathInfo.substring("/student/".length()));
                List<Marks> marks = marksDAO.getMarksByStudentId(studentId);
                ApiResponse.sendSuccess(response, marks, "Marks retrieved successfully");
                
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (NumberFormatException e) {
            ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid student ID");
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to retrieve marks: " + e.getMessage());
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        try {
            Marks marks = objectMapper.readValue(request.getReader(), Marks.class);
            
            // Validate required fields
            if (marks.getStudentId() == 0 || marks.getSubjectId() == 0 || 
                marks.getMarksObtained() < 0 || marks.getTotalMarks() <= 0) {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Student ID, Subject ID, and valid marks are required");
                return;
            }
            
            // Add marks
            int marksId = marksDAO.addMarks(marks);
            
            if (marksId > 0) {
                Marks addedMarks = marksDAO.getMarksById(marksId);
                ApiResponse.sendSuccess(response, addedMarks, "Marks added successfully");
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Failed to add marks");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to add marks: " + e.getMessage());
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        
        try {
            if (pathInfo == null || pathInfo.length() <= 1) {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Marks ID is required");
                return;
            }
            
            int marksId = Integer.parseInt(pathInfo.substring(1));
            Marks marks = objectMapper.readValue(request.getReader(), Marks.class);
            
            boolean updated = marksDAO.updateMarks(marksId, marks);
            
            if (updated) {
                Marks updatedMarks = marksDAO.getMarksById(marksId);
                ApiResponse.sendSuccess(response, updatedMarks, "Marks updated successfully");
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Marks not found");
            }
            
        } catch (NumberFormatException e) {
            ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid marks ID");
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to update marks: " + e.getMessage());
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        
        try {
            if (pathInfo == null || pathInfo.length() <= 1) {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Marks ID is required");
                return;
            }
            
            int marksId = Integer.parseInt(pathInfo.substring(1));
            boolean deleted = marksDAO.deleteMarks(marksId);
            
            if (deleted) {
                ApiResponse.sendSuccess(response, null, "Marks deleted successfully");
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Marks not found");
            }
            
        } catch (NumberFormatException e) {
            ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid marks ID");
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to delete marks: " + e.getMessage());
        }
    }
}
