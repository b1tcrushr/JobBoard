-- Create Database
CREATE DATABASE IF NOT EXISTS job_coop_portal;
USE job_coop_portal;

-- create company table. links to employer, job postings, applications
CREATE TABLE companies (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    headquarters_location VARCHAR(255),
    company_size VARCHAR(255),
    company_website VARCHAR(255),
    company_description TEXT
);

-- users table. links to employers table and candidates table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'employer', 'admin') NOT NULL,
    phone VARCHAR(255),
    location VARCHAR(255)
);

-- employer table
CREATE TABLE employers (
    employer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    company_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- candidate table
CREATE TABLE candidates (
    candidate_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    applications_sent INT NOT NULL DEFAULT 0,
    interviews_scheduled INT NOT NULL DEFAULT 0,
    not_selected INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- job postings table
CREATE TABLE job_postings (
    job_id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    company_id INT NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_location VARCHAR(255),
    work_type VARCHAR(20) NOT NULL,
    job_type VARCHAR(20) NOT NULL,
    job_description VARCHAR(4000) NOT NULL,
    job_status VARCHAR(20) NOT NULL,
    experience_level VARCHAR(255),
    role_type ENUM('Full-Time', 'Part-Time', 'Co-op'),
    pay_grade ENUM('Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'),
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    INDEX idx_jobs_status (job_status),
    INDEX idx_jobs_employer (employer_id),
    INDEX idx_jobs_company (company_id),
    FOREIGN KEY (employer_id) REFERENCES employers(employer_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- application table for who applied to what
CREATE TABLE applications (
    app_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    company_id INT NOT NULL,
    candidate_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'applied',
    resume_text TEXT,
    cover_letter TEXT,
    UNIQUE (candidate_id, job_id),
    INDEX idx_applications_candidate (candidate_id),
    INDEX idx_applications_job (job_id),
    FOREIGN KEY (job_id) REFERENCES job_postings(job_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
);
