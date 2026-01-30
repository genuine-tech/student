package com.studentmanagement.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.studentmanagement.database.DatabaseManager;
import com.studentmanagement.model.Marks;

public class MarksDAO {

    // Add new marks entry
    public int addMarks(Marks marks) throws SQLException {
        String query = "INSERT INTO marks (student_id, subject_id, marks_obtained, total_marks, exam_type, exam_date) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setInt(1, marks.getStudentId());
            pstmt.setInt(2, marks.getSubjectId());
            pstmt.setDouble(3, marks.getMarksObtained());
            pstmt.setDouble(4, marks.getTotalMarks());
            pstmt.setString(5, marks.getExamType());
            pstmt.setDate(6, marks.getExamDate() != null ? Date.valueOf(marks.getExamDate()) : null);
            
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

    // Update marks
    public boolean updateMarks(int id, Marks marks) throws SQLException {
        String query = "UPDATE marks SET marks_obtained = ?, total_marks = ?, exam_type = ?, exam_date = ? WHERE id = ?";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setDouble(1, marks.getMarksObtained());
            pstmt.setDouble(2, marks.getTotalMarks());
            pstmt.setString(3, marks.getExamType());
            pstmt.setDate(4, marks.getExamDate() != null ? Date.valueOf(marks.getExamDate()) : null);
            pstmt.setInt(5, id);
            
            return pstmt.executeUpdate() > 0;
        }
    }

    // Delete marks
    public boolean deleteMarks(int id) throws SQLException {
        String query = "DELETE FROM marks WHERE id = ?";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        }
    }

    // Get all marks for a student
    public List<Marks> getMarksByStudentId(int studentId) throws SQLException {
        List<Marks> marksList = new ArrayList<>();
        String query = "SELECT m.*, s.name as subject_name, s.code as subject_code " +
                      "FROM marks m " +
                      "JOIN subjects s ON m.subject_id = s.id " +
                      "WHERE m.student_id = ? " +
                      "ORDER BY m.exam_date DESC";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, studentId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                marksList.add(mapResultSetToMarks(rs));
            }
        }
        
        return marksList;
    }

    // Get marks for a specific subject and student
    public List<Marks> getMarksByStudentAndSubject(int studentId, int subjectId) throws SQLException {
        List<Marks> marksList = new ArrayList<>();
        String query = "SELECT m.*, s.name as subject_name, s.code as subject_code " +
                      "FROM marks m " +
                      "JOIN subjects s ON m.subject_id = s.id " +
                      "WHERE m.student_id = ? AND m.subject_id = ? " +
                      "ORDER BY m.exam_date DESC";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, studentId);
            pstmt.setInt(2, subjectId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                marksList.add(mapResultSetToMarks(rs));
            }
        }
        
        return marksList;
    }

    // Get all marks (for admin)
    public List<Marks> getAllMarks() throws SQLException {
        List<Marks> marksList = new ArrayList<>();
        String query = "SELECT m.*, st.name as student_name, s.name as subject_name, s.code as subject_code " +
                      "FROM marks m " +
                      "JOIN students st ON m.student_id = st.id " +
                      "JOIN subjects s ON m.subject_id = s.id " +
                      "ORDER BY m.exam_date DESC";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            while (rs.next()) {
                Marks marks = mapResultSetToMarks(rs);
                marks.setStudentName(rs.getString("student_name"));
                marksList.add(marks);
            }
        }
        
        return marksList;
    }

    // Get marks by ID
    public Marks getMarksById(int id) throws SQLException {
        String query = "SELECT m.*, s.name as subject_name, s.code as subject_code " +
                      "FROM marks m " +
                      "JOIN subjects s ON m.subject_id = s.id " +
                      "WHERE m.id = ?";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToMarks(rs);
            }
        }
        
        return null;
    }

    private Marks mapResultSetToMarks(ResultSet rs) throws SQLException {
        Marks marks = new Marks();
        marks.setId(rs.getInt("id"));
        marks.setStudentId(rs.getInt("student_id"));
        marks.setSubjectId(rs.getInt("subject_id"));
        marks.setMarksObtained(rs.getDouble("marks_obtained"));
        marks.setTotalMarks(rs.getDouble("total_marks"));
        marks.setExamType(rs.getString("exam_type"));
        
        Date examDate = rs.getDate("exam_date");
        if (examDate != null) {
            marks.setExamDate(examDate.toLocalDate());
        }
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            marks.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            marks.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        marks.setSubjectName(rs.getString("subject_name"));
        marks.setSubjectCode(rs.getString("subject_code"));
        
        return marks;
    }
}
