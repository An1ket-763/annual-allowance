-- =====================================================
-- LeaveTracker Database Setup
-- =====================================================
-- This file helps anyone cloning the project
-- to create the required MySQL database schema.
--
-- HOW TO USE:
-- 1. Open MySQL shell or any DB client
-- 2. Run:
--      source path/to/database.sql
-- 3. Update backend .env with your DB credentials
-- =====================================================
-- -------------------------
-- 1. Create Database
-- -------------------------
CREATE DATABASE IF NOT EXISTS leavetracker;
USE leavetracker;
-- -------------------------
-- 2. Departments Table
-- -------------------------
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- -------------------------
-- 3. Users Table
-- -------------------------
-- Stores authentication data
-- Role: 'ADMIN' | 'EMPLOYEE'
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'EMPLOYEE') NOT NULL,
    must_change_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- -------------------------
-- 4. Employees Table
-- -------------------------
-- Stores employee profile info
-- Linked 1:1 with users
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    department_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);
-- -------------------------
-- 5. Leave Requests Table
-- -------------------------
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
-- =====================================================
-- 6. Seed / Demo Data (Safe to share)
-- =====================================================
-- Departments
INSERT INTO departments (name)
VALUES ('Engineering'),
    ('HR'),
    ('Finance');
-- Admin User
-- password: admin123 (hashed in backend, replace if needed)
INSERT INTO users (email, password, role, must_change_password)
VALUES (
        'admin@leavetracker.com',
        '$2b$10$dummyhashedpasswordreplaceinbackend',
        'ADMIN',
        FALSE
    );
-- Employee User
INSERT INTO users (email, password, role)
VALUES (
        'employee@leavetracker.com',
        '$2b$10$dummyhashedpasswordreplaceinbackend',
        'EMPLOYEE'
    );
-- Employee Profile
INSERT INTO employees (user_id, department_id, name, joining_date)
VALUES (
        2,
        1,
        'Demo Employee',
        '2024-01-01'
    );
-- Sample Leave Request
INSERT INTO leave_requests (employee_id, start_date, end_date, reason)
VALUES (
        1,
        '2025-01-10',
        '2025-01-12',
        'Personal work'
    );
-- =====================================================
-- END OF FILE
-- =====================================================