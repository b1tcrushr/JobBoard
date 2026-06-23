-- create company table first so other tables can use it
CREATE TABLE company (
    company_id INT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    headquarters_location VARCHAR(255)
);

-- employer table
CREATE TABLE employer (
    employer_id INT PRIMARY KEY,
    company_id INT NOT NULL REFERENCES company(company_id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- candidate table
CREATE TABLE candidate (
    candidate_id INT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    employed BOOLEAN NOT NULL DEFAULT FALSE
);

-- job postings table
CREATE TABLE job_posting (
    job_id INT PRIMARY KEY,
    employer_id INT NOT NULL REFERENCES employer(employer_id),
    company_id INT NOT NULL REFERENCES company(company_id),
    job_title VARCHAR(255) NOT NULL,
    job_location VARCHAR(255),
    work_type VARCHAR(20) NOT NULL CHECK (work_type IN ('in person', 'hybrid', 'remote')),
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('full time', 'part time', 'contract'))
);

-- application table for who applied to what
CREATE TABLE application (
    app_id INT PRIMARY KEY,
    job_id INT NOT NULL REFERENCES job_posting(job_id),
    company_id INT NOT NULL REFERENCES company(company_id),
    candidate_id INT NOT NULL REFERENCES candidate(candidate_id),
    status VARCHAR(20) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'rejected', 'interview')),

    -- make sure they can't apply to the same job twice
    UNIQUE (candidate_id, job_id)
);
