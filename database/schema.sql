-- Student Management System Database Schema
-- Create database and table for student management system

-- Create database
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    course VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    dob DATE,
    city VARCHAR(100),
    password VARCHAR(255), -- Password for student login (will be added for existing students)
    roll_number VARCHAR(20) UNIQUE, -- Unique roll number for each student
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create admin table for authentication
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin (username, password) VALUES 
('admin', 'admin123');

-- Insert sample students data
INSERT INTO students (name, email, phone, course, gender, dob, city) VALUES 
('John Doe', 'john.doe@email.com', '1234567890', 'Computer Science', 'Male', '1998-05-10', 'New York'),
('Jane Smith', 'jane.smith@email.com', '0987654321', 'Mathematics', 'Female', '1999-08-22', 'Los Angeles'),
('Mike Johnson', 'mike.johnson@email.com', '1122334455', 'Physics', 'Male', '1997-02-13', 'Chicago'),
('Sarah Wilson', 'sarah.wilson@email.com', '5566778899', 'Chemistry', 'Female', '2000-11-30', 'Houston'),
('David Brown', 'david.brown@email.com', '9988776655', 'Biology', 'Male', '1996-07-21', 'Philadelphia');

-- Create courses table for reference
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample courses
INSERT INTO courses (name, description) VALUES 
('Computer Science', 'Study of computational systems and programming'),
('Mathematics', 'Study of numbers, structures, and patterns'),
('Physics', 'Study of matter, energy, and their interactions'),
('Chemistry', 'Study of matter and chemical reactions'),
('Biology', 'Study of living organisms and life processes'),
('Arts', 'Study of creative and cultural expressions'),
('Commerce', 'Study of trade, business and economics'),
('Engineering', 'Study of design, building and machines');

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    course VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample subjects
INSERT INTO subjects (name, code, course) VALUES 
('Data Structures', 'CS101', 'Computer Science'),
('Algorithms', 'CS102', 'Computer Science'),
('Database Systems', 'CS103', 'Computer Science'),
('Web Development', 'CS104', 'Computer Science'),
('Calculus', 'MATH101', 'Mathematics'),
('Linear Algebra', 'MATH102', 'Mathematics'),
('Statistics', 'MATH103', 'Mathematics'),
('Mechanics', 'PHY101', 'Physics'),
('Thermodynamics', 'PHY102', 'Physics'),
('Electromagnetism', 'PHY103', 'Physics');

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    exam_type VARCHAR(50) DEFAULT 'Regular', -- Regular, Mid-term, Final
    exam_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, subject_id, attendance_date)
);
