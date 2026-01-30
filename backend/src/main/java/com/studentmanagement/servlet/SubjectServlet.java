package com.studentmanagement.servlet;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentmanagement.dao.SubjectDAO;
import com.studentmanagement.model.Subject;
import com.studentmanagement.util.ApiResponse;

@WebServlet("/api/subjects/*")
public class SubjectServlet extends HttpServlet {
    
    private SubjectDAO subjectDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        subjectDAO = new SubjectDAO();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        
        try {
            if (pathInfo == null || "/".equals(pathInfo)) {
                // Get all subjects
                List<Subject> subjects = subjectDAO.getAllSubjects();
                ApiResponse.sendSuccess(response, subjects, "Subjects retrieved successfully");
                
            } else if (pathInfo.startsWith("/course/")) {
                // Get subjects by course
                String course = pathInfo.substring("/course/".length());
                List<Subject> subjects = subjectDAO.getSubjectsByCourse(course);
                ApiResponse.sendSuccess(response, subjects, "Subjects retrieved successfully");
                
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to retrieve subjects: " + e.getMessage());
        }
    }
}
