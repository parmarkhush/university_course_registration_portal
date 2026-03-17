CREATE DATABASE IF NOT EXISTS university_portal;
USE university_portal;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    program VARCHAR(120) NOT NULL DEFAULT 'B.Tech Computer Science',
    academic_level VARCHAR(80) NOT NULL DEFAULT 'Undergraduate',
    advisor_name VARCHAR(120) NOT NULL DEFAULT 'Dr. Anjali Rao',
    advisor_department VARCHAR(120) NOT NULL DEFAULT 'Computer Science',
    advisor_email VARCHAR(255) NOT NULL DEFAULT 'advisor@university.edu',
    outstanding_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_credits INT NOT NULL DEFAULT 24,
    base_credits INT NOT NULL DEFAULT 0,
    has_hold TINYINT(1) NOT NULL DEFAULT 0,
    completed_course_ids JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    roll_no VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    cpi DECIMAL(4,2) NOT NULL,
    preferred_courses JSON NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);
