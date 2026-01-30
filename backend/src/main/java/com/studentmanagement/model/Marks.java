package com.studentmanagement.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Marks {
    private int id;
    private int studentId;
    private int subjectId;
    private double marksObtained;
    private double totalMarks;
    private String examType;
    private LocalDate examDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for display
    private String studentName;
    private String subjectName;
    private String subjectCode;

    // Constructors
    public Marks() {}

    public Marks(int studentId, int subjectId, double marksObtained, double totalMarks, String examType, LocalDate examDate) {
        this.studentId = studentId;
        this.subjectId = subjectId;
        this.marksObtained = marksObtained;
        this.totalMarks = totalMarks;
        this.examType = examType;
        this.examDate = examDate;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public int getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(int subjectId) {
        this.subjectId = subjectId;
    }

    public double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public double getPercentage() {
        return (marksObtained / totalMarks) * 100;
    }
}
