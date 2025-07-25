# 🚀 KPI TT Cloud - User Management System

## 📁 Cấu trúc Hệ thống

### 🌐 **Frontend Files (Main System)**
- `start-system.html` - **Main entry point** - Trang chính để khởi động hệ thống
- `index.html` - Landing page
- `dashboard.html` - Dashboard chính
- `User-Management.html` - **Quản lý người dùng** (chức năng chính)
- `Task-Management.html` - Quản lý công việc
- `auth/login.html` - Trang đăng nhập

### 🔧 **Backend API**
- `api/simple-server.js` - **API Server chính** (Node.js + Express)
- `api/user-management-api.js` - API quản lý users (MySQL version)
- `api/package.json` - Dependencies
- `api/uploads/` - Thư mục upload files

### 🗄️ **Database**
- `database/users_db_schema.sql` - Schema chính
- `database/simple_schema.sql` - Schema đơn giản
- `simple-setup.sql` - Setup script
- `import-database.bat` - Import script Windows
- `setup-db.bat` - Setup database Windows

### 🎨 **Assets**
- `assets/css/` - Stylesheets
- `assets/js/` - JavaScript files
- `templates/` - HTML templates

### 📚 **Documentation**
- `KPI-Business-Requirements.md` - **BRD chính**
- `SETUP-INSTRUCTIONS.md` - Hướng dẫn cài đặt
- `DEPLOYMENT-GUIDE.md` - Hướng dẫn deploy
- `Roles-Permissions-Matrix.md` - Ma trận phân quyền

### 🐳 **Docker**
- `docker-compose.yml` - Docker setup chính
- `docker-compose-simple.yml` - Docker setup đơn giản
- `api/Dockerfile` - API container

## 🚀 **Cách chạy hệ thống**

### **Option 1: Simple Mode (Recommended)**
```bash
# 1. Start API Server
cd api
node simple-server.js

# 2. Start Web Server (Python)
python -m http.server 8080

# 3. Access system
http://localhost:8080/start-system.html
```

### **Option 2: Full Database Mode**
```bash
# 1. Setup MySQL database
mysql -u root -p < database/users_db_schema.sql

# 2. Start API with database
cd api
node user-management-api.js

# 3. Start web server and access system
```

## 🔑 **Login Credentials**
- **Username:** admin
- **Password:** admin123

## ✨ **Main Features**
- ✅ User Management (CRUD, Import/Export)
- ✅ Role & Team Management (18 roles, 14 teams)
- ✅ Authentication & Authorization
- ✅ Task Management
- ✅ Dashboard & KPI Tracking
- ✅ Responsive Design
- ✅ Vietnamese Language Support

## 🏢 **Team Structure (BRD)**
- **IaaS Layer:** Teams 1-5 (Vmware, Openstack, Private Cloud, Storage, Network)
- **PaaS Layer:** Teams 6-10 (DevOps, K8S, DB, Cloudwatch, CMP)
- **Software Layer:** Teams 11-13 (ATM, CRM, DMP)
- **Manage Layer:** Team 14 (Manage)

## 📞 **Support**
Hệ thống được thiết kế cho 500 concurrent users với architecture microservice.
