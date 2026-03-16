# University Course Registration Portal

The University Course Registration Portal is a web-based application that helps students browse available courses, plan schedules, and register online. It also gives faculty and administrators a simple way to monitor enrollments, manage courses, and review academic information.

## Project Purpose

This project is designed to:

- allow students to view and register for university courses online
- reduce manual administrative work during registration periods
- help faculty and administrators manage course offerings and seat availability
- support a clearer and more efficient registration experience

## Stakeholders

- Students
- Faculty Advisors
- Registrar Staff
- Department Administrators
- System Administrators
- University Administration

## Current Features in the Frontend

- user login and registration
- student profile form with CPI and preferred course selection
- student overview with advisor, registration, and payment status
- available course listing with search, filters, sorting, and seat counts
- course enrollment and unenrollment
- waitlist support for full courses
- notifications for registration and waitlist updates
- weekly schedule summary for enrolled courses
- registration rule checks for holds, prerequisites, schedule conflicts, and credit limits
- attendance dashboard
- student ranking view

## Software Requirements Specification Summary

The portal SRS is organized into the following major sections:

### 1. Introduction

- Purpose
- Document Conventions
- Intended Audience
- Project Scope
- References

### 2. Overall Description

- Product Perspective
- Product Functions
- User Classes, Characteristics, and Needs
- Operating Environment
- Design and Implementation Constraints
- User Documentation
- Assumptions and Dependencies

### 3. System Features and Functional Requirements

- User Management and Authentication
- Course Catalog Management
- Registration Management
- Schedule Management
- Academic Advising Support
- Waitlist Management
- Payment Integration
- Reporting and Analytics
- Notification System
- Content Management

### 4. External Interface Requirements

- User Interfaces
- Hardware Interfaces
- Software Interfaces
- Communications Interfaces

### 5. Non-Functional Requirements

- Performance Requirements
- Security Requirements
- Reliability and Availability
- Usability and Accessibility
- Maintainability and Portability
- Legal and Compliance Requirements
- Operational Requirements

### 6. Other Requirements

- Data Migration
- Internationalization Requirements
- Training Requirements

### Appendices

- Appendix A: Analysis Models
- Appendix B: Issues List

## Key Functional Requirement Areas

- SSO-based authentication and role-based access control
- course catalog browsing with search, filters, and availability
- registration validation for prerequisites, credit limits, and time conflicts
- add, drop, and withdrawal workflows
- schedule builder and weekly schedule view
- academic advising and approval support
- waitlist processing and notifications
- reports, announcements, and administrative controls

## Key Non-Functional Requirement Areas

- fast page loads and responsive registration flows
- secure handling of sensitive information
- high availability during peak registration periods
- WCAG-aligned accessibility support
- scalable and maintainable system design

## Documentation Files Included

- `SRS.docx`
- `Sequence_Diagram.png`
- `Activity_Diagram.png`
- `Class_Diagram.jpeg`
- `Component diagram.jpeg`
- `Deployment diagram.jpeg`

## Notes

- The detailed SRS remains available in `SRS.docx`.
- The web portal now reflects several SRS requirements directly in the UI instead of showing the SRS as a dashboard section.
- Registration, login, and student information can now be connected to a MySQL database through the included Node.js backend.

## MySQL Setup

1. Install MySQL and create the database objects from `mysql-schema.sql`.
2. Copy `.env.example` to `.env` and fill in your MySQL username, password, host, port, and database name.
3. Install dependencies with `npm install`.
4. Start the app with `npm start`.
5. Open `http://localhost:3000`.

## Stored in MySQL

- registered users from the portal sign-up form
- login validation against saved users
- student profile records saved from the dashboard form
- student ranking data based on saved CPI values
