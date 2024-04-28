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
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,  -- File size in bytes
    upload_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- Folders Table
CREATE TABLE folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    folder_name VARCHAR(255) NOT NULL,
    folder_path VARCHAR(255) NOT NULL,
    creation_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
