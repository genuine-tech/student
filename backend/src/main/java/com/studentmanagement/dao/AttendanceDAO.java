package com.studentmanagement.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.studentmanagement.database.DatabaseManager;
import com.studentmanagement.model.Attendance;

public class AttendanceDAO {

    // Mark attendance
    public int markAttendance(Attendance attendance) throws SQLException {
        String query = "INSERT INTO attendance (student_id, subject_id, attendance_date, status) " +
                      "VALUES (?, ?, ?, ?) " +
                      "ON DUPLICATE KEY UPDATE status = ?";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setInt(1, attendance.getStudentId());
            pstmt.setInt(2, attendance.getSubjectId());
            pstmt.setDate(3, Date.valueOf(attendance.getAttendanceDate()));
            pstmt.setString(4, attendance.getStatus());
            pstmt.setString(5, attendance.getStatus());
            
            int rowsAffected = pstmt.executeUpdate();
            
            if (rowsAffected > 0) {
                ResultSet rs = pstmt.getGeneratedKeys();
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        
        return -1;
    }

    // Get attendance for a student
    public List<Attendance> getAttendanceByStudentId(int studentId) throws SQLException {
        List<Attendance> attendanceList = new ArrayList<>();
        String query = "SELECT a.*, s.name as subject_name, s.code as subject_code " +
                      "FROM attendance a " +
                      "JOIN subjects s ON a.subject_id = s.id " +
                      "WHERE a.student_id = ? " +
                      "ORDER BY a.attendance_date DESC";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, studentId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                attendanceList.add(mapResultSetToAttendance(rs));
            }
        }
        
        return attendanceList;
    }

    // Get attendance by student and subject
    public List<Attendance> getAttendanceByStudentAndSubject(int studentId, int subjectId) throws SQLException {
        List<Attendance> attendanceList = new ArrayList<>();
        String query = "SELECT a.*, s.name as subject_name, s.code as subject_code " +
                      "FROM attendance a " +
                      "JOIN subjects s ON a.subject_id = s.id " +
                      "WHERE a.student_id = ? AND a.subject_id = ? " +
                      "ORDER BY a.attendance_date DESC";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, studentId);
            pstmt.setInt(2, subjectId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                attendanceList.add(mapResultSetToAttendance(rs));
            }
        }
        
        return attendanceList;
    }

    // Get attendance percentage for student
    public Map<String, Double> getAttendancePercentage(int studentId) throws SQLException {
        Map<String, Double> percentageMap = new HashMap<>();
        String query = "SELECT s.name as subject_name, " +
                      "COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present, " +
                      "COUNT(*) as total " +
                      "FROM attendance a " +
                      "JOIN subjects s ON a.subject_id = s.id " +
                      "WHERE a.student_id = ? " +
                      "GROUP BY a.subject_id, s.name";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, studentId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                String subjectName = rs.getString("subject_name");
                int present = rs.getInt("present");
                int total = rs.getInt("total");
                double percentage = total > 0 ? (present * 100.0 / total) : 0.0;
                percentageMap.put(subjectName, percentage);
            }
        }
        
        return percentageMap;
    }

    // Get all attendance records (for admin)
    public List<Attendance> getAllAttendance() throws SQLException {
        List<Attendance> attendanceList = new ArrayList<>();
        String query = "SELECT a.*, st.name as student_name, s.name as subject_name, s.code as subject_code " +
                      "FROM attendance a " +
                      "JOIN students st ON a.student_id = st.id " +
                      "JOIN subjects s ON a.subject_id = s.id " +
                      "ORDER BY a.attendance_date DESC";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            while (rs.next()) {
                Attendance attendance = mapResultSetToAttendance(rs);
                attendance.setStudentName(rs.getString("student_name"));
                attendanceList.add(attendance);
            }
        }
        
        return attendanceList;
    }

    // Get attendance for a specific date and subject (for admin marking)
    public List<Attendance> getAttendanceByDateAndSubject(Date date, int subjectId) throws SQLException {
        List<Attendance> attendanceList = new ArrayList<>();
        String query = "SELECT a.*, st.name as student_name, s.name as subject_name, s.code as subject_code " +
                      "FROM attendance a " +
                      "JOIN students st ON a.student_id = st.id " +
                      "JOIN subjects s ON a.subject_id = s.id " +
                      "WHERE a.attendance_date = ? AND a.subject_id = ?";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setDate(1, date);
            pstmt.setInt(2, subjectId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Attendance attendance = mapResultSetToAttendance(rs);
                attendance.setStudentName(rs.getString("student_name"));
                attendanceList.add(attendance);
            }
        }
        
        return attendanceList;
    }

    // Delete attendance record
    public boolean deleteAttendance(int id) throws SQLException {
        String query = "DELETE FROM attendance WHERE id = ?";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        }
    }

    private Attendance mapResultSetToAttendance(ResultSet rs) throws SQLException {
        Attendance attendance = new Attendance();
        attendance.setId(rs.getInt("id"));
        attendance.setStudentId(rs.getInt("student_id"));
        attendance.setSubjectId(rs.getInt("subject_id"));
        
        Date attendanceDate = rs.getDate("attendance_date");
        if (attendanceDate != null) {
            attendance.setAttendanceDate(attendanceDate.toLocalDate());
        }
        
        attendance.setStatus(rs.getString("status"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            attendance.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        attendance.setSubjectName(rs.getString("subject_name"));
        attendance.setSubjectCode(rs.getString("subject_code"));
        
        return attendance;
    }
}
