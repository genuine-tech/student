# Student Management System

A full-stack student management application built with React and Java Servlets (Jetty).

## Prerequisites

-   **Node.js** (for Frontend)
-   **Java JDK 21+** & **Maven** (for Backend)
-   **MySQL** (Optional: Internal H2 database is used by default for local dev)

## Project Structure

-   `frontend/`: React application
-   `backend/`: Java Servlet REST API (runs on Jetty)
-   `database/`: Database scripts (if needed)

## How to Run Locally

### 1. Backend (Java Servlets + Jetty)

The backend uses an internal **H2 Database** by default, so no external database setup is required to start.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Run the application using Maven:
    ```bash
    mvn jetty:run
    ```
    *Alternatively, open the `backend` folder in IntelliJ IDEA or Eclipse and run using the Maven `jetty:run` goal.*

The backend will start on **http://localhost:8080**.

### 2. Frontend (React)

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```

The frontend will open at **http://localhost:3000**.

## Troubleshooting

### Backend: "The JAVA_HOME environment variable is not defined correctly"

If you encounter this error when running `mvn jetty:run`, it means your `JAVA_HOME` environment variable is missing or pointing to an invalid directory.

**How to fix on Windows:**

1.  **Locate your JDK installation**: It is usually in `C:\Program Files\Java\jdk-<version>`.
2.  **Set JAVA_HOME temporarily (PowerShell)**:
    ```powershell
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"  # Replace with your actual path
    ```
3.  **Set JAVA_HOME permanently**:
    *   Search for "Edit the system environment variables" in the Start menu.
    *   Click **Environment Variables**.
    *   Under **System variables**, click **New**.
    *   Variable name: `JAVA_HOME`
    *   Variable value: `C:\Program Files\Java\jdk-21` (or your specific path).
    *   Click **OK** on all dialogs and **restart your terminal**.
