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
    cp .env.example .env      # then fill in DB_PASSWORD and JWT_SECRET
    npm run db:init           # creates the users and notes tables
    npm run dev

Health check: GET http://localhost:5000/api/health (also reports if the database is reachable)

### Auth API

Login state is kept in an httpOnly `token` cookie (JWT, valid for 1 day).

| Method | Route | Body | Notes |
|---|---|---|---|
| POST | /api/auth/signup | `{ name, email, password }` | password: 8+ characters. Logs the user in |
| POST | /api/auth/login | `{ email, password }` | Rate limited to 10 tries / 15 min |
| POST | /api/auth/logout | | Clears the cookie |
| GET | /api/auth/me | | Needs login, returns the current user |
