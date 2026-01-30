package com.studentmanagement.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Student model class representing a student entity
 * This class contains all student-related properties and methods
 */
public class Student {
    
    private int id;
    private String name;
    private String email;
    private String phone;
    private String course;
    private String gender;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;
    private String city;
    private String password; // Password for student login
    private String rollNumber; // Unique roll number
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public Student() {}
    
    // Constructor with all fields
    public Student(int id, String name, String email, String phone, String course, String gender, LocalDate dob, String city) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.course = course;
        this.gender = gender;
        this.dob = dob;
        this.city = city;
    }
    
    // Constructor without ID (for new students)
    public Student(String name, String email, String phone, String course, String gender, LocalDate dob, String city) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.course = course;
        this.gender = gender;
        this.dob = dob;
        this.city = city;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getCourse() {
        return course;
    }
    
    public void setCourse(String course) {
        this.course = course;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
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
    
    /**
     * Validate student data
     * @return true if all required fields are valid, false otherwise
     */
    public boolean isValid() {
        return name != null && !name.trim().isEmpty() &&
               email != null && !email.trim().isEmpty() &&
               phone != null && !phone.trim().isEmpty() &&
               course != null && !course.trim().isEmpty() &&
               email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") &&
               phone.matches("^[+]?[1-9]\\d{0,15}$");
    }
    
    /**
     * Get validation error message
     * @return validation error message or null if valid
     */
    public String getValidationError() {
        if (name == null || name.trim().isEmpty()) {
            return "Name is required";
        }
        if (email == null || email.trim().isEmpty()) {
            return "Email is required";
        }
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return "Invalid email format";
        }
        if (phone == null || phone.trim().isEmpty()) {
            return "Phone is required";
        }
        if (!phone.matches("^[+]?[1-9]\\d{0,15}$")) {
            return "Invalid phone format";
        }
        if (course == null || course.trim().isEmpty()) {
            return "Course is required";
        }
        if (dob != null) {
            if (dob.isAfter(LocalDate.now())) {
                return "Date of birth cannot be in the future";
            }
        }
        return null;
    }
    
    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", course='" + course + '\'' +
                ", gender='" + gender + '\'' +
                ", dob='" + dob + '\'' +
                ", city='" + city + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Student student = (Student) obj;
        return id == student.id;
    }
    
    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }
}
