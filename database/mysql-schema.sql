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

CREATE TABLE IF NOT EXISTS faculty_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    faculty_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(120) NOT NULL DEFAULT 'Computer Science',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_user_id INT NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    attended_classes INT NOT NULL DEFAULT 0,
    total_classes INT NOT NULL DEFAULT 0,
    updated_by_faculty_id INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_attendance_faculty
        FOREIGN KEY (updated_by_faculty_id) REFERENCES faculty_users(id)
        ON DELETE SET NULL,
    CONSTRAINT uq_attendance_student_subject UNIQUE (student_user_id, subject_name)
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_user_id INT NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent') NOT NULL,
    updated_by_faculty_id INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_sessions_student
        FOREIGN KEY (student_user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_attendance_sessions_faculty
        FOREIGN KEY (updated_by_faculty_id) REFERENCES faculty_users(id)
        ON DELETE SET NULL,
    CONSTRAINT uq_attendance_session UNIQUE (student_user_id, subject_name, attendance_date)
);

CREATE TABLE IF NOT EXISTS student_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_user_id INT NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    ia_marks DECIMAL(6,2) NOT NULL DEFAULT 0,
    mid_sem_marks DECIMAL(6,2) NOT NULL DEFAULT 0,
    end_sem_marks DECIMAL(6,2) NOT NULL DEFAULT 0,
    score DECIMAL(6,2) NOT NULL DEFAULT 0,
    max_score DECIMAL(6,2) NOT NULL DEFAULT 100,
    updated_by_faculty_id INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_marks_student
        FOREIGN KEY (student_user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_marks_faculty
        FOREIGN KEY (updated_by_faculty_id) REFERENCES faculty_users(id)
        ON DELETE SET NULL,
    CONSTRAINT uq_marks_student_subject UNIQUE (student_user_id, subject_name)
);

CREATE TABLE IF NOT EXISTS faculty_announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_roll_no VARCHAR(100) NULL,
    pdf_file_name VARCHAR(255) NULL,
    pdf_mime_type VARCHAR(120) NULL,
    pdf_base64 LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcements_faculty
        FOREIGN KEY (faculty_user_id) REFERENCES faculty_users(id)
        ON DELETE CASCADE
);

INSERT INTO faculty_users (username, faculty_name, email, password, department)
VALUES
    ('apt', 'Ashish Patel', 'apt@university.edu', 'faculty123', 'Computer Engineering'),
    ('arni', 'Archana Nigam', 'arni@university.edu', 'faculty123', 'Computer Engineering'),
    ('bht', 'Bhaumik Thakkar', 'bht@university.edu', 'faculty123', 'Computer Engineering'),
    ('kms', 'Komal Singh', 'kms@university.edu', 'faculty123', 'Computer Engineering'),
    ('ntd', 'Nishant Doshi', 'ntd@university.edu', 'faculty123', 'Computer Engineering'),
    ('shm', 'Shakti Mishra', 'shm@university.edu', 'faculty123', 'Computer Engineering'),
    ('sjd', 'Sanjeev Dwivedi', 'sjd@university.edu', 'faculty123', 'Computer Engineering'),
    ('tabh', 'Tanmay Bhowmik', 'tabh@university.edu', 'faculty123', 'Computer Engineering')
ON DUPLICATE KEY UPDATE
    faculty_name = VALUES(faculty_name),
    email = VALUES(email),
    password = VALUES(password),
    department = VALUES(department);
