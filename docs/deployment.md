# Deployment Architecture & Configuration

## 1. Overview
The Lost & Found Intelligence System adopts a modern decoupled deployment topology:
- **Frontend**: Static single-page application hosted on **GitHub Pages**.
- **Backend**: Containerized Spring Boot REST service hosted on **Railway**, **Render**, or any Java cloud VM.
- **Database**: Cloud MySQL 8.0+ instance (e.g. PlanetScale, AWS RDS, Railway MySQL, or local MySQL).

```
                      +-----------------------------+
                      |        GitHub Pages         |
                      |   (Static React Assets)     |
                      +-----------------------------+
                                     |
                                     | HTTPS REST (CORS restricted)
                                     v
                      +-----------------------------+
                      |   Cloud Java Host (Render)  |
                      |   Spring Boot 3.2 Backend   |
                      +-----------------------------+
                                     |
                                     | TCP 3306 (SSL)
                                     v
                      +-----------------------------+
                      |       Managed MySQL         |
                      +-----------------------------+
```

## 2. Frontend Deployment (GitHub Pages)

### 2.1 Automated GitHub Actions
The repository includes `.github/workflows/frontend-deploy.yml`. When changes are pushed to `main`, GitHub Actions automatically:
1. Checks out the repository.
2. Sets up Node.js 20.
3. Installs dependencies (`npm ci` inside `frontend/`).
4. Builds the production bundle (`npm run build`).
5. Uploads and deploys the `frontend/dist` folder to GitHub Pages.

### 2.2 Client-Side Routing Strategy
To prevent 404 errors on browser refresh under GitHub Pages static hosting, the frontend utilizes React `HashRouter`. All routes (e.g. `/#/lost`, `/#/map`, `/#/dsa`) are resolved client-side without requiring server-side URL rewrite rules.

### 2.3 Environment Configuration
In production, set the GitHub Actions repository secret or Vite environment variable:
```env
VITE_API_URL=https://your-backend-app.onrender.com/api
```

---

## 3. Backend Deployment (Render / Railway / Docker)

### 3.1 Environment Variables
Configure the following environment variables in your cloud hosting dashboard:
```env
PORT=8080
DB_URL=jdbc:mysql://your-cloud-mysql-host:3306/lost_found_db?useSSL=true&allowPublicKeyRetrieval=true
DB_USERNAME=cloud_user
DB_PASSWORD=your_secure_db_password
DB_DRIVER=com.mysql.cj.jdbc.Driver
JPA_DIALECT=org.hibernate.dialect.MySQLDialect
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
CORS_ALLOWED_ORIGINS=https://<your-username>.github.io
```

### 3.2 Docker Deployment (Optional Dockerfile)
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/lost-found-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 4. Database Setup & Migration
1. Provision a MySQL 8.0 database.
2. Execute `database/schema.sql` to establish tables, foreign keys, and indexes.
3. (Optional) Execute `database/sample-data.sql` to seed the 10 campus locations, users, and demonstration items.