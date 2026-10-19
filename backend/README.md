# FinTrack – Backend Technical Documentation & Integration Manual

**Project Name:** FinTrack – Personal Financial Management System  
**Backend Framework:** Java 21, Spring Boot 3.2.5 (Spring Web, Spring Data JPA, Spring Security, JWT, Maven)  
**Database:** MySQL 8.0+  
**Authentication:** JWT (HMAC-SHA256) + BCrypt (Strength 10)  
**Port:** 8080 (REST API Base URL: `http://localhost:8080/api`)

---

## 1. Prerequisites
- **Java**: JDK 17 or JDK 21 installed.
- **Maven**: Maven 3.8+ (A portable Maven 3.9.6 is available in `scratch/apache-maven-3.9.6/bin/mvn.cmd`).
- **MySQL**: MySQL Server 8.0+ running on port 3306.

---

## 2. Database Setup

### Step 2.1: Create MySQL Database & Tables
You can either let Spring Boot create tables automatically via `spring.jpa.hibernate.ddl-auto=update` or manually execute `database/schema.sql` in MySQL Workbench or MySQL CLI:

```bash
mysql -u root -p < database/schema.sql
```

### Step 2.2: Configure Database Credentials
Edit `src/main/resources/application.properties` to set your MySQL password:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fintrack?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

## 3. How to Build & Run the Backend

### Build the Application:
```bash
# Using Maven
mvn clean package -DskipTests

# Or using the portable Maven in scratch directory:
..\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
```

### Run the Application:
```bash
# Option A: Run via Maven
mvn spring-boot:run

# Option B: Run the standalone packaged JAR
java -jar target/fintrack-backend-1.0.0.jar
```

The application will start on: **`http://localhost:8080`**.

---

## 4. REST API Endpoint Reference

All endpoints return JSON and use standard HTTP status codes.  
Protected endpoints require the header: `Authorization: Bearer <token>`.

### 4.1 Authentication APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account. Returns token and user object. |
| `POST` | `/api/auth/login` | Public | Login with email and password. Returns token and user object. |
| `POST` | `/api/auth/logout` | Authenticated | Logout and invalidate session. |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile. |

#### Sample Login Request:
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "alex.johnson@example.com",
  "password": "password123"
}
```

#### Sample Login Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": 1,
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "currency": "₹",
    "role": "Student Account"
  }
}
```

---

### 4.2 Dashboard Aggregator API
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Authenticated | Returns 6 metric cards, budget status, recent 5 expenses, 4 upcoming bills, and 4-month comparison chart. |

---

### 4.3 Budget Planning APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/budget` | Authenticated | Fetch current user's monthly budget allocations. |
| `PUT` | `/api/budget` | Authenticated | Update budget allocations (income, food, travel, education, bills, other, savingsTarget). |

---

### 4.4 Daily Expenses APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/expenses` | Authenticated | Fetch expenses (supports query params `?category=` and `?search=`). Sorted by date DESC. |
| `POST` | `/api/expenses` | Authenticated | Create a new expense. |
| `PUT` | `/api/expenses/{id}` | Authenticated | Update existing expense by ID. |
| `DELETE` | `/api/expenses/{id}` | Authenticated | Delete expense by ID. |

---

### 4.5 Savings Goals APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/savings` | Authenticated | Fetch all savings goals with progress percentages. |
| `POST` | `/api/savings` | Authenticated | Create new savings goal. |
| `PATCH` | `/api/savings/{id}/deposit` | Authenticated | Quick deposit funds (`{"amount": 50.00}`). |
| `PUT` | `/api/savings/{id}` | Authenticated | Update savings goal. |
| `DELETE` | `/api/savings/{id}` | Authenticated | Delete savings goal by ID. |

---

### 4.6 Bills & Reminders APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/bills` | Authenticated | Fetch bills (supports `?status=all|pending|paid`). Sorted by due date ASC. |
| `POST` | `/api/bills` | Authenticated | Create new recurring bill reminder. |
| `PATCH` | `/api/bills/{id}/toggle-status` | Authenticated | Toggle bill status between `Pending` and `Paid`. |
| `DELETE` | `/api/bills/{id}` | Authenticated | Delete bill reminder. |

---

### 4.7 Reports & Analytics APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports` | Authenticated | Returns KPI scorecard (including savings rate %), category doughnut distribution, and 5-month comparison bar chart. |

---

## 5. Security & Strict Data Isolation

1. **Password Hashing**: BCrypt with strength 10. Passwords are never stored in plain text.
2. **JWT Authentication**: Expiring tokens (24 hours default) signed with HS256 secret.
3. **Data Isolation**: Every database query is scoped strictly to `user_id = authenticated_user.id`. User A can NEVER view, mutate, or delete records belonging to User B.
4. **CORS Configuration**: Pre-configured in `SecurityConfig.java` to accept origins from `http://127.0.0.1:5500`, `http://localhost:5500`, `http://localhost:3000`, etc.
