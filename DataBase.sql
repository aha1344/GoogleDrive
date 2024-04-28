CREATE DATABASE userDB;
USE userDB;
-- drop database userDB;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Files Table
CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    upload_date DATETIME,
    status ENUM('active', 'trashed') DEFAULT 'active', -- Add a status column with ENUM type
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Folders Table
CREATE TABLE folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    folder_name VARCHAR(255),
    folder_path VARCHAR(255),
    creation_date DATETIME,
    status ENUM('active', 'trashed') DEFAULT 'active', -- Add a status column with ENUM type
    FOREIGN KEY (user_id) REFERENCES users(id)
);
