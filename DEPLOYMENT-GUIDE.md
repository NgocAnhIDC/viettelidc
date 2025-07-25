# KPI TT Cloud - Deployment Guide

## 📋 **Development vs Production Structure**

### **Development Environment (Local Testing)**
```
start-system.html → auth/login.html → User-Management.html
```
- Có demo accounts hiển thị
- Có debugging info
- Redirect test pages

### **Production Environment (Deploy)**
```
production-index.html → dashboard.html → [modules]
```
- Clean login interface
- No demo accounts visible
- Professional dashboard
- Auto-detect API endpoints

## 🚀 **Production Deployment Steps**

### **1. File Structure for Production**
```
/
├── production-index.html    (Main entry point)
├── dashboard.html          (Main dashboard)
├── User-Management.html    (User management)
├── Task-Management.html    (Task management)
├── KPI-Dashboard.html      (KPI reports)
├── Settings.html           (System settings)
├── api/                    (Backend API)
│   ├── user-management-api.js
│   ├── package.json
│   └── node_modules/
└── database/
    └── users_db_schema.sql
```

### **2. Rename Files for Production**
```bash
# Rename main entry point
mv production-index.html index.html

# Keep development files for testing
# start-system.html (keep for dev)
# auth/login.html (keep for dev)
```

### **3. Database Setup (Production)**

#### **Option A: MySQL Server**
```sql
-- Create database
CREATE DATABASE kpi_tt_cloud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Import schema
mysql -u [username] -p kpi_tt_cloud < database/users_db_schema.sql
```

#### **Option B: Docker MySQL**
```bash
# Run MySQL container
docker run -d \
  --name kpi-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=kpi_tt_cloud \
  -p 3306:3306 \
  mysql:8.0

# Import schema
docker exec -i kpi-mysql mysql -uroot -pyour_password kpi_tt_cloud < database/users_db_schema.sql
```

### **4. API Configuration (Production)**

#### **Update API Configuration**
```javascript
// In api/user-management-api.js
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kpi_tt_cloud',
    port: process.env.DB_PORT || 3306
};

const PORT = process.env.PORT || 3001;
```

#### **Create .env file**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kpi_tt_cloud
DB_PORT=3306

# Server Configuration
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here

# Environment
NODE_ENV=production
```

### **5. Web Server Setup**

#### **Option A: Nginx + Node.js**
```nginx
# /etc/nginx/sites-available/kpi-tt-cloud
server {
    listen 80;
    server_name your-domain.com;
    
    # Serve static files
    location / {
        root /var/www/kpi-tt-cloud;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **Option B: Apache + Node.js**
```apache
# /etc/apache2/sites-available/kpi-tt-cloud.conf
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/kpi-tt-cloud
    
    # Serve static files
    <Directory /var/www/kpi-tt-cloud>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Proxy API requests
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
</VirtualHost>
```

### **6. Process Management**

#### **Using PM2 (Recommended)**
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'kpi-tt-cloud-api',
    script: './api/user-management-api.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};

# Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### **Using systemd**
```ini
# /etc/systemd/system/kpi-tt-cloud.service
[Unit]
Description=KPI TT Cloud API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/kpi-tt-cloud
ExecStart=/usr/bin/node api/user-management-api.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### **7. Docker Deployment**

#### **Create Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY api/package*.json ./api/
RUN cd api && npm ci --only=production

# Copy application files
COPY . .

EXPOSE 3001

CMD ["node", "api/user-management-api.js"]
```

#### **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=kpi_tt_cloud
    depends_on:
      - mysql
    volumes:
      - ./:/app

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=kpi_tt_cloud
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/users_db_schema.sql:/docker-entrypoint-initdb.d/schema.sql

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./:/usr/share/nginx/html
    depends_on:
      - app

volumes:
  mysql_data:
```

## 🔧 **Production Checklist**

### **Security**
- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Remove demo accounts
- [ ] Enable rate limiting

### **Performance**
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Use CDN for static assets
- [ ] Monitor resource usage

### **Monitoring**
- [ ] Setup application logs
- [ ] Configure error tracking
- [ ] Monitor API performance
- [ ] Setup database monitoring
- [ ] Configure alerts

### **Backup**
- [ ] Database backup strategy
- [ ] Application files backup
- [ ] Configuration backup
- [ ] Recovery procedures

## 🌐 **User Access Flow (Production)**

1. **User visits**: `https://your-domain.com`
2. **Loads**: `index.html` (production login)
3. **After login**: `dashboard.html` (main dashboard)
4. **Navigation**: Access modules via dashboard
5. **API calls**: Auto-detect production endpoints

## 📱 **Mobile Responsive**

All pages are mobile-responsive and work on:
- Desktop browsers
- Tablets
- Mobile phones
- Different screen sizes

## 🔄 **Updates & Maintenance**

### **Code Updates**
```bash
# Pull latest code
git pull origin main

# Update dependencies
cd api && npm update

# Restart services
pm2 restart kpi-tt-cloud-api
```

### **Database Updates**
```bash
# Backup before update
mysqldump -u root -p kpi_tt_cloud > backup_$(date +%Y%m%d).sql

# Apply updates
mysql -u root -p kpi_tt_cloud < database/update_schema.sql
```

---

**🎯 Summary**: Production users start from `index.html` → `dashboard.html`, while development uses `start-system.html` for testing and setup.
