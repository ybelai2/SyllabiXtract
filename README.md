# SyllabiXtract

**Turn course syllabi into a consolidated, editable deadline calendar.**

[Try the hosted application](https://syllabi-xtract.vercel.app/) · [Browse source](https://github.com/ybelai2/SyllabiXtract)

SyllabiXtract is a **collaborative full-stack course project**. Students upload PDF, DOC, or DOCX syllabi; the application uses document processing and language-model extraction to organize assignments, exams, and deadlines into a user-specific calendar.

### At a glance

| Layer | Implementation |
| --- | --- |
| Web interface | React, Vite, Tailwind CSS |
| Backend | Java 17, Spring Boot, Spring Security |
| Database | PostgreSQL + Hibernate/JPA |
| Authentication | Auth0 |
| Document/AI integrations | LlamaParse, Gemini |

**Engineering questions this project addresses:** connecting authenticated UI and API flows, converting loosely structured documents into structured events, and storing user-specific calendar changes.

**Team:** Richard Savoca · Brendon Young · William Nwafor · Yohannes Belai · Sinit Mebrahtom.

> This repository describes a team deliverable. Individual code ownership is not claimed here; inspect commit history and pull requests for contributions. AI-generated dates must be reviewed against the original syllabus before they are trusted.

---

## Installation and local development
## 1. Instructions for Installing Necessary Software

To run this project locally, ensure you have the following software installed on your machine.

**Java 17 (Required)**
This project utilizes Java 17 or higher. 
* To install Java 17, visit [this Oracle archive site](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html).
* Follow the on-site [installation instructions](https://docs.oracle.com/en/java/javase/26/install/index.html) to properly configure Java on your system.

**Other Required Software**
* **[Node.js](https://nodejs.org/) (v18 or higher):** Required to execute the JavaScript frontend and manage React packages.
* **[Maven](https://maven.apache.org/):** Required to manage and install the Java backend dependencies.
* **[PostgreSQL](https://www.postgresql.org/):** Required to host the local database. You must have a PostgreSQL server running locally.

---

## 2. Instructions for Installing Necessary Packages

This project uses separate package managers for the frontend and backend. 

### Frontend Packages (Node/NPM)
The frontend utilizes core packages including `react`, `@auth0/auth0-react`, `tailwindcss`, `vite`, `date-fns`, and `ics`.

**To install the frontend packages:**
1. Open a terminal and navigate to the `frontend` directory.
2. Run the following command to download all dependencies:
    ```bash
    npm install
    ```

### Backend Packages (Java/Maven)
The backend relies on the Spring Boot Starter Web, Data JPA (Hibernate), PostgreSQL Driver, Spring Security (OAuth2 Resource Server), and JSON object mappers. 

**To install the backend packages:**
1. Open a terminal and navigate to the `backend` directory.
2. Run the following command to download all Maven dependencies and build the project:
    ```bash
    mvn clean install -DskipTests
    ```

---

## 3. Step-by-Step Instructions to Run the Entire Code

Before running the code, you must configure the environment variables so the frontend and backend can communicate with the server and external APIs.

### Part A: Environment Configuration

**1. Frontend Configuration**
Create a `.env` file in the root of the `frontend` directory and add the Auth0 keys:
```env
VITE_AUTH0_DOMAIN=dev-evpwqsgmn03lqsfk.us.auth0.com
VITE_AUTH0_CLIENT_ID=SeOofXeNJOUQSgA7uGbBnFSgl7pJhWej
VITE_AUTH0_AUDIENCE=https://api.syllabixtract.com
```

**2. Backend Configuration**
Navigate to `backend/src/main/resources/application.properties` and ensure the database and API variables are set. Replace the database variables with your local PostgreSQL credentials:

```properties
server.port=8080
spring.application.name=api

# Database Connection
spring.datasource.url=jdbc:postgresql://localhost:5432/syllabixtract_db
spring.datasource.username=YOUR_LOCAL_DB_USER
spring.datasource.password=YOUR_LOCAL_DB_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Auth0 Security Variables
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://dev-evpwqsgmn03lqsfk.us.auth0.com/
auth0.audience=https://api.syllabixtract.com

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
LLAMA_CLOUD_API_KEY=your_llamaparse_api_key_here
```

### Part B: Execution Steps

**Step 1: Start the Database Server**
* Ensure your PostgreSQL server is running and the database specified in your `application.properties` URL (`syllabixtract_db`) has been created.

**Step 2: Start the Backend Server**
* Open a terminal inside the `backend` directory.
* Execute the following command to start the Spring Boot application:
    ```bash
    mvn spring-boot:run
    ```
* Wait for the terminal to display `Started ApiApplication`. The server is now securely listening for connections on `http://localhost:8080`.

**Step 3: Start the Frontend Server**
* Open a **new** terminal window and navigate to the `frontend` directory.
* Execute the following command to boot the Vite development server:
    ```bash
    npm run dev
    ```
* The terminal will output a local URL (e.g., `http://localhost:5173`). 

**Step 4: Using the Application**
1. Navigate to `http://localhost:5173` in your web browser.
2. Click **Get Started** and log in or sign up via Auth0.
3. Drag and drop up to 5 Syllabus files (.pdf, .doc, or .docx) into the upload zone.
4. Click **Extract Schedule**. The frontend will pass the files to the Spring Boot server, which will process the text, save the initial structure to PostgreSQL, and return the events to the React UI.
5. You can now interact with the calendar. Click **Save Calendar** at the bottom to push any date or text modifications permanently to the backend server.
---
