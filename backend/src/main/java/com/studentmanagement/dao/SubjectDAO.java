package com.studentmanagement.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.studentmanagement.database.DatabaseManager;
import com.studentmanagement.model.Subject;

public class SubjectDAO {

    public List<Subject> getAllSubjects() throws SQLException {
        List<Subject> subjects = new ArrayList<>();
        String query = "SELECT id, name, code, course, created_at FROM subjects ORDER BY course, name";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            while (rs.next()) {
                subjects.add(mapResultSetToSubject(rs));
            }
        }
        
        return subjects;
    }

    public List<Subject> getSubjectsByCourse(String course) throws SQLException {
        List<Subject> subjects = new ArrayList<>();
        String query = "SELECT id, name, code, course, created_at FROM subjects WHERE course = ? ORDER BY name";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setString(1, course);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                subjects.add(mapResultSetToSubject(rs));
            }
        }
        
        return subjects;
    }

    public Subject getSubjectById(int id) throws SQLException {
        String query = "SELECT id, name, code, course, created_at FROM subjects WHERE id = ?";
        
        try (Connection conn = DatabaseManager.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToSubject(rs);
            }
        }
        
        return null;
    }

    private Subject mapResultSetToSubject(ResultSet rs) throws SQLException {
        Subject subject = new Subject();
        subject.setId(rs.getInt("id"));
        subject.setName(rs.getString("name"));
        subject.setCode(rs.getString("code"));
        subject.setCourse(rs.getString("course"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            subject.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        return subject;
    }
}
