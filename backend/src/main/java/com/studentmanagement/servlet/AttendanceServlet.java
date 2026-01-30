package com.studentmanagement.servlet;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentmanagement.dao.AttendanceDAO;
import com.studentmanagement.model.Attendance;
import com.studentmanagement.util.ApiResponse;

@WebServlet("/api/attendance/*")
public class AttendanceServlet extends HttpServlet {
    
    private AttendanceDAO attendanceDAO;
    private ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        attendanceDAO = new AttendanceDAO();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        
        try {
            if (pathInfo == null || "/".equals(pathInfo)) {
                // Get all attendance (for admin)
                List<Attendance> attendance = attendanceDAO.getAllAttendance();
                ApiResponse.sendSuccess(response, attendance, "Attendance retrieved successfully");
                
            } else if (pathInfo.startsWith("/student/")) {
                String remaining = pathInfo.substring("/student/".length());
                
                if (remaining.endsWith("/percentage")) {
                    // Get attendance percentage
                    int studentId = Integer.parseInt(remaining.replace("/percentage", ""));
                    Map<String, Double> percentage = attendanceDAO.getAttendancePercentage(studentId);
                    ApiResponse.sendSuccess(response, percentage, "Attendance percentage retrieved successfully");
                } else {
                    // Get attendance for specific student
                    int studentId = Integer.parseInt(remaining);
                    List<Attendance> attendance = attendanceDAO.getAttendanceByStudentId(studentId);
                    ApiResponse.sendSuccess(response, attendance, "Attendance retrieved successfully");
                }
                
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (NumberFormatException e) {
            ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid student ID");
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to retrieve attendance: " + e.getMessage());
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        try {
            Attendance attendance = objectMapper.readValue(request.getReader(), Attendance.class);
            
            // Validate required fields
            if (attendance.getStudentId() == 0 || attendance.getSubjectId() == 0 || 
                attendance.getAttendanceDate() == null || attendance.getStatus() == null) {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Student ID, Subject ID, date, and status are required");
                return;
            }
            
            // Mark attendance
            int attendanceId = attendanceDAO.markAttendance(attendance);
            
            if (attendanceId > 0) {
                List<Attendance> updatedAttendance = attendanceDAO.getAttendanceByStudentId(attendance.getStudentId());
                ApiResponse.sendSuccess(response, updatedAttendance, "Attendance marked successfully");
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Failed to mark attendance");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to mark attendance: " + e.getMessage());
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        
        try {
            if (pathInfo == null || pathInfo.length() <= 1) {
                ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Attendance ID is required");
                return;
            }
            
            int attendanceId = Integer.parseInt(pathInfo.substring(1));
            boolean deleted = attendanceDAO.deleteAttendance(attendanceId);
            
            if (deleted) {
                ApiResponse.sendSuccess(response, null, "Attendance deleted successfully");
            } else {
                ApiResponse.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Attendance not found");
            }
            
        } catch (NumberFormatException e) {
            ApiResponse.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid attendance ID");
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Failed to delete attendance: " + e.getMessage());
        }
    }
}
