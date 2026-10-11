# Deployment Architecture & Configuration

## 1. Overview
The Lost & Found Intelligence System adopts a decoupled cloud deployment topology:
- **Frontend**: Static single-page application hosted on **GitHub Pages**, **Vercel**, or **Netlify**.
- **Backend**: Containerized Spring Boot REST service hosted on **Render**, **Railway**, **Fly.io**, or any cloud VM.
- **Database**: Embedded zero-config H2 file database (persisted to `./data/`), or external cloud MySQL/PostgreSQL.

```
                      +-----------------------------+
                      |        GitHub Pages         |
                      |   (Static React Assets)     |
                      +-----------------------------+
                                     |
                                     | HTTPS REST (CORS enabled)
                                     v
                      +-----------------------------+
                      |   Cloud Java Host (Render)  |
                      |   Spring Boot 3.2 Backend   |
                      +-----------------------------+
                                     |
                                     | Local File / Managed DB
                                     v
                      +-----------------------------+
                      |    H2 File / Cloud MySQL    |
                      +-----------------------------+
```

---

## 2. Backend Deployment

### Option A: Render (Recommended - 1-Click via Blueprint)
1. Go to [Render.com](https://render.com) and click **New > Blueprint**.
2. Connect your GitHub repository: `veeradurgasai/DSA_Capstone`.
3. Render automatically detects `render.yaml` and sets up the Java Web Service with:
   - **Root Directory**: `backend`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/lost-found-backend-1.0.0.jar`
4. Click **Apply**.
5. Once deployed, Render provides your public URL (e.g., `https://lost-found-backend-xxxx.onrender.com`).

### Option B: Render or Railway via Docker
The repository includes a multi-stage `Dockerfile` in the root and in `backend/`:
1. Connect your GitHub repository to Render or Railway.
2. Select **Docker** environment.
3. Railway/Render automatically builds the JAR using Maven 3.9 + Java 17 and runs it in a lightweight Alpine container.

### Option C: Manual Cloud Configuration (Render / Railway / Heroku)
- **Root Directory**: `backend`
- **Build Command**: `./mvnw clean package -DskipTests` (or `mvn clean package -DskipTests`)
- **Start Command**: `java -Dserver.port=$PORT -jar target/lost-found-backend-1.0.0.jar`
- **Environment Variables**:
  ```env
  PORT=10000
  SERVER_ADDRESS=0.0.0.0
  CORS_ALLOWED_ORIGINS=https://veeradurgasai.github.io,http://localhost:5173
  ```

---

## 3. Frontend Deployment (GitHub Pages)

### 3.1 Automated GitHub Actions
The repository includes `.github/workflows/frontend-deploy.yml`. When changes are pushed to `main`, GitHub Actions automatically:
1. Checks out the repository.
2. Installs dependencies (`npm ci` inside `frontend/`).
3. Compiles the production bundle (`npm run build`).
4. Deploys to GitHub Pages.

### 3.2 Connecting Frontend to Your Deployed Backend
To link your deployed GitHub Pages frontend to your deployed backend:
1. Go to your GitHub repository: `veeradurgasai/DSA_Capstone`.
2. Click **Settings > Secrets and variables > Actions**.
3. Add a **New repository secret**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-service.onrender.com/api` (replace with your actual Render URL ending in `/api`)
4. Re-run the GitHub Pages deployment workflow.

---

## 4. Verification & Health Checks
After deploying, verify the backend endpoints:
- Public Lost Items: `GET https://your-backend.onrender.com/api/items/lost`
- Campus Graph Locations: `GET https://your-backend.onrender.com/api/campus/locations`
- Trie Search Suggestions: `GET https://your-backend.onrender.com/api/search/autocomplete?prefix=mac`