CREATE DATABASE IF NOT EXISTS university_portal;

CREATE USER IF NOT EXISTS 'portal_app'@'localhost' IDENTIFIED BY 'change_this_password';
ALTER USER 'portal_app'@'localhost' IDENTIFIED BY 'change_this_password';

GRANT ALL PRIVILEGES ON university_portal.* TO 'portal_app'@'localhost';
FLUSH PRIVILEGES;
