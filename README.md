# cohort-10-mern-20749-maheen
Cohort 10 — MERN (NodeJS+ReactJS) assignment for Maheen Fatima

## Backend

### 1. Database (MySQL 8)

Log in to MySQL as root (MySQL Workbench or the mysql CLI) and create the database and an app user:

```sql
CREATE DATABASE IF NOT EXISTS notes_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'notes_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON notes_app.* TO 'notes_user'@'localhost';
```

### 2. Run the server

    cd backend
    npm install
    cp .env.example .env      # then fill in DB_PASSWORD
    npm run db:init           # creates the users and notes tables
    npm run dev

Health check: GET http://localhost:5000/api/health (also reports if the database is reachable)
