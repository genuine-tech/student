package com.studentmanagement.model;

import java.time.LocalDateTime;

public class Subject {
    private int id;
    private String name;
    private String code;
    private String course;
    private LocalDateTime createdAt;

    // Constructors
    public Subject() {}

    public Subject(int id, String name, String code, String course) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.course = course;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
