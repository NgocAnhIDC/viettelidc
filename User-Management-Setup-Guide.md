# 👥 User & Role Data Management Setup Guide

## 📋 Tổng quan

Bước 2 trong roadmap Task Management Production Ready đã hoàn thành:
- Database schema cho users, roles, teams
- User Management API với authentication
- User Management UI cho admin
- Docker deployment setup
- Integration với authentication system

## 🏗️ Kiến trúc Hệ thống

### Database Schema (`users_db`)
```
users_db/
├── users              # User information
├── roles              # Role definitions with permissions
├── teams              # 14 teams across 4 layers
├── user_roles         # User-Role assignments (many-to-many)
├── user_teams         # User-Team assignments (many-to-many)
├── user_history       # Audit trail for user changes
└── user_sessions      # Session management
```

### API Endpoints (`Port 3001`)
```
Authentication:
POST /api/auth/login     # User login
POST /api/auth/logout    # User logout
GET  /api/auth/validate  # Token validation

User Management:
GET  /api/users          # List all users
GET  /api/roles          # List all roles
GET  /api/teams          # List all teams
GET  /api/health         # Health check
```

### UI Components
- **User Management Interface** (`User-Management.html`)
- **Authentication Integration** (updated `assets/js/auth.js`)
- **Home Page Module Access** (updated `index.html`)

## 🚀 Cách triển khai

### Option 1: Docker Deployment (Recommended)

**Prerequisites:**
- Docker & Docker Compose
- Node.js 16+

**Steps:**
```bash
# 1. Clone/setup project
cd KPI-TT-Cloud

# 2. Run setup script
./setup.sh

# 3. Access application
# Web: http://localhost
# API: http://localhost:3001
```

### Option 2: Manual Setup

**1. Database Setup:**
```bash
# Install MySQL 8.0
# Create database and run schema
mysql -u root -p < database/users_db_schema.sql
```

**2. API Setup:**
```bash
cd api
npm install
npm start
```

**3. Web Server:**
```bash
# Serve static files on port 80
# Or use any web server (nginx, apache, etc.)
```

## 🔐 Authentication Integration

### Updated Authentication Flow

1. **Login Process:**
   - User enters credentials in `auth/login.html`
   - Frontend calls `/api/auth/login`
   - API validates against database
   - Returns JWT token + user info
   - Frontend stores token and redirects

2. **Session Management:**
   - Token stored in localStorage
   - 15-minute timeout with activity tracking
   - API validates token on each request
   - Session data stored in database

3. **Permission Checking:**
   - Permissions calculated from user roles
   - UI elements shown/hidden based on permissions
   - API endpoints protected with middleware

### Demo Accounts

| Username | Password | Role | Teams | Database ID |
|----------|----------|------|-------|-------------|
| `admin` | `admin123` | Admin | Team 1, 2 | 1 |
| `cpo` | `cpo123` | CPO | Team 1, 2, 3 | 2 |
| `pm1` | `pm123` | PM | Team 1 | 3 |
| `po1` | `po123` | PO | Team 1 | 4 |
| `dev1` | `dev123` | Dev | Team 1 | 5 |

## 👥 User Management Features

### Current Features (Completed)
- ✅ User listing with search and filters
- ✅ Role-based access control
- ✅ Team-based filtering
- ✅ Status management (active/inactive)
- ✅ Real-time data loading from API
- ✅ Responsive design
- ✅ Permission-based UI updates

### Planned Features (Next Phase)
- 🔄 User CRUD operations (Create, Update, Delete)
- 🔄 Role assignment interface
- 🔄 Team assignment interface
- 🔄 Bulk operations
- 🔄 User import/export
- 🔄 Password reset functionality
- 🔄 User activity logs

## 🗄️ Database Details

### 14 Teams Structure
```sql
-- IaaS Layer (5 teams)
Team 1: Public Cloud Vmware
Team 2: Public Cloud Openstack  
Team 3: Private Cloud
Team 4: Storage
Team 5: Network

-- PaaS Layer (5 teams)
Team 6: DevOps
Team 7: K8S
Team 8: DB
Team 9: Cloudwatch
Team 10: CMP

-- Software Layer (3 teams)
Team 11: ATM
Team 12: CRM
Team 13: DMP

-- Manage Layer (1 team)
Team 14: Manage
```

### Role Permissions Matrix
```json
{
  "Admin": {
    "canView": true, "canCreate": true, "canEdit": true, 
    "canDelete": true, "canApprove": true, "canImport": true, 
    "scope": "all"
  },
  "CPO": {
    "canView": true, "canCreate": false, "canEdit": true, 
    "canDelete": false, "canApprove": true, "canImport": true, 
    "scope": "all"
  },
  "PM/PO": {
    "canView": true, "canCreate": true, "canEdit": true, 
    "canDelete": false, "canApprove": true, "canImport": true, 
    "scope": "team"
  }
  // ... other roles
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_USER=kpi_user
DB_PASSWORD=kpi_password
DB_NAME=users_db

# JWT
JWT_SECRET=kpi-tt-cloud-jwt-secret-key-2025

# API
API_PORT=3001
NODE_ENV=development
```

### Docker Services
```yaml
services:
  mysql:     # Port 3306
  redis:     # Port 6379  
  user-api:  # Port 3001
  nginx:     # Port 80
```

## 🧪 Testing

### API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get users (with token)
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### UI Testing
1. Open `http://localhost`
2. Login with demo account
3. Navigate to "Quản lý Người dùng"
4. Test search and filters
5. Verify permission-based UI

## 🚨 Troubleshooting

### Common Issues

**1. API Connection Failed**
```bash
# Check if API is running
docker-compose ps
curl http://localhost:3001/api/health

# Check logs
docker-compose logs user-api
```

**2. Database Connection Error**
```bash
# Check MySQL status
docker-compose exec mysql mysql -u kpi_user -p users_db

# Verify schema
docker-compose exec mysql mysql -u kpi_user -p -e "SHOW TABLES" users_db
```

**3. Authentication Issues**
- Clear localStorage in browser
- Check JWT token expiration
- Verify demo account credentials
- Check API logs for authentication errors

**4. Permission Denied**
- Verify user role assignments in database
- Check permission calculation in auth.js
- Ensure API middleware is working

### Development Mode
```bash
# Run API in development mode
cd api
npm run dev

# Watch for file changes
nodemon user-management-api.js
```

## 📈 Next Steps

### Phase 3: Master Data Configuration
- Setup 14 teams data
- Configure work types and categories
- Setup products/services per team
- Configure business rules

### Phase 4: Task Management Backend API
- Convert static HTML to real backend
- Database integration for tasks
- Real-time updates
- File upload support

### Phase 5: Production Deployment
- SSL/HTTPS setup
- Performance optimization
- Monitoring and logging
- Backup strategies

## 📞 Support

### Development Support
- Check console logs for JavaScript errors
- Verify API responses in Network tab
- Use browser dev tools for debugging

### Database Support
- Access MySQL via Docker: `docker-compose exec mysql mysql -u kpi_user -p users_db`
- Check user_sessions table for active sessions
- Verify role and team assignments

---

**Tạo:** 2025-01-26  
**Cập nhật:** 2025-01-26  
**Trạng thái:** Ready for Testing  
**Bước tiếp theo:** Master Data Configuration
