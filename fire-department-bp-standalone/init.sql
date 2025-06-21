-- Fire Department BP Management Database Initialization
CREATE DATABASE IF NOT EXISTS bp_management;
CREATE USER IF NOT EXISTS bp_user WITH PASSWORD 'bp_password';
GRANT ALL PRIVILEGES ON DATABASE bp_management TO bp_user;
