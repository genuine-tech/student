package com.studentmanagement;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DatabaseSetup {
    public static void initialize() {
        String url = "jdbc:h2:~/student_management;MODE=MySQL;DB_CLOSE_DELAY=-1";
        String user = "sa";
        String password = "";

        try {
            Class.forName("org.h2.Driver");
            System.out.println("Connecting to H2 Database...");
            // H2 creates the database automatically if it doesn't exist
            try (Connection conn = DriverManager.getConnection(url, user, password);
                    Statement stmt = conn.createStatement()) {

                System.out.println("Connected! Creating tables...");

                String[] sqls = {
                        "CREATE TABLE IF NOT EXISTS students (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, phone VARCHAR(15) NOT NULL, course VARCHAR(50) NOT NULL, gender VARCHAR(10), dob DATE, city VARCHAR(100), password VARCHAR(255), roll_number VARCHAR(20) UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",

                        "CREATE TABLE IF NOT EXISTS admin (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
                        "INSERT INTO admin (username, password) VALUES ('admin', 'admin123') ON DUPLICATE KEY UPDATE password='admin123'",

                        "CREATE TABLE IF NOT EXISTS courses (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",

                        "INSERT INTO courses (name, description) VALUES ('Computer Science', 'Study of computational systems and programming'), ('Mathematics', 'Study of numbers, structures, and patterns'), ('Physics', 'Study of matter, energy, and their interactions'), ('Chemistry', 'Study of matter and chemical reactions'), ('Biology', 'Study of living organisms and life processes'), ('Arts', 'Study of creative and cultural expressions'), ('Commerce', 'Study of trade, business and economics'), ('Engineering', 'Study of design, building and machines') ON DUPLICATE KEY UPDATE description=VALUES(description)",

                        "CREATE TABLE IF NOT EXISTS subjects (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, code VARCHAR(20) UNIQUE NOT NULL, course VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",

                        "INSERT INTO subjects (name, code, course) VALUES ('Data Structures', 'CS101', 'Computer Science'), ('Algorithms', 'CS102', 'Computer Science'), ('Database Systems', 'CS103', 'Computer Science'), ('Web Development', 'CS104', 'Computer Science'), ('Calculus', 'MATH101', 'Mathematics'), ('Linear Algebra', 'MATH102', 'Mathematics'), ('Statistics', 'MATH103', 'Mathematics'), ('Mechanics', 'PHY101', 'Physics'), ('Thermodynamics', 'PHY102', 'Physics'), ('Electromagnetism', 'PHY103', 'Physics') ON DUPLICATE KEY UPDATE name=VALUES(name), course=VALUES(course)",

                        "CREATE TABLE IF NOT EXISTS marks (id INT AUTO_INCREMENT PRIMARY KEY, student_id INT NOT NULL, subject_id INT NOT NULL, marks_obtained DECIMAL(5,2) NOT NULL, total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00, exam_type VARCHAR(50) DEFAULT 'Regular', exam_date DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE)",

                        "CREATE TABLE IF NOT EXISTS attendance (id INT AUTO_INCREMENT PRIMARY KEY, student_id INT NOT NULL, subject_id INT NOT NULL, attendance_date DATE NOT NULL, status ENUM('Present', 'Absent', 'Late') NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE, UNIQUE KEY unique_attendance (student_id, subject_id, attendance_date))"
                };

                for (String sql : sqls) {
                    try {
                        stmt.execute(sql);
                        System.out.println("Executed: " + (sql.length() > 50 ? sql.substring(0, 50) + "..." : sql));
                    } catch (Exception e) {
                        System.out.println("Error executing SQL: " + e.getMessage());
                    }
                }

                System.out.println("Database setup complete.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Database initialization failed: " + e.getMessage());
        }
    }
}
