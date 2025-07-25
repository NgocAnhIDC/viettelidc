# 🔐 Authentication System Setup Guide

## 📋 Tổng quan

Authentication system đã được tích hợp vào Task Management để cung cấp:
- Đăng nhập với username/password
- Session management với timeout 15 phút
- Role-based permissions
- Team-based access control
- Remember me functionality

## 🚀 Cách sử dụng

### 1. Truy cập hệ thống

**Bước 1:** Mở trình duyệt và truy cập:
```
file:///path/to/your/project/index.html
```

**Bước 2:** Hệ thống sẽ tự động chuyển hướng đến trang đăng nhập nếu chưa authenticate.

### 2. Đăng nhập

**Demo Accounts có sẵn:**

| Username | Password | Role | Teams | Permissions |
|----------|----------|------|-------|-------------|
| `admin` | `admin123` | Admin | Team 1, Team 2 | Full access |
| `cpo` | `cpo123` | CPO | All teams | View all, approve monthly tasks |
| `pm1` | `pm123` | PM | Team 1 | Create/edit in Team 1, approve personal tasks |
| `po1` | `po123` | PO | Team 1 | Create/edit in Team 1, approve personal tasks |
| `dev1` | `dev123` | Dev | Team 1 | View only, edit own tasks |

**Bước đăng nhập:**
1. Nhập username và password
2. Chọn "Ghi nhớ đăng nhập" nếu muốn
3. Click "Đăng nhập"

### 3. Sử dụng Task Management

Sau khi đăng nhập thành công:
- Hệ thống hiển thị thông tin user ở header
- Các button/tính năng được hiển thị theo permissions
- Tasks được filter theo team permissions (nếu có)
- Approval workflow hoạt động theo role

## 🔧 Tính năng Authentication

### Session Management
- **Timeout:** 15 phút từ hoạt động cuối
- **Activity tracking:** Reset timer khi user tương tác
- **Auto logout:** Thông báo và logout khi hết session

### Role-based Permissions

#### Admin
- ✅ View all tasks
- ✅ Create/edit/delete tasks
- ✅ Approve any task
- ✅ Import/export
- ✅ Access all teams

#### CPO (Chief Product Officer)
- ✅ View all tasks
- ✅ Edit tasks (limited)
- ✅ Approve monthly tasks
- ✅ Import tasks
- ✅ Access all teams

#### PM/PO (Project Manager/Product Owner)
- ✅ View all tasks
- ✅ Create/edit tasks in their teams
- ✅ Approve personal tasks in their teams
- ✅ Import tasks
- 🔒 Limited to assigned teams

#### Dev/BA/Tester/DevOps
- ✅ View all tasks
- 🔒 No create/edit permissions
- 🔒 No approval permissions
- 🔒 No import permissions

### Team-based Access Control
- Users có thể thuộc nhiều teams
- Permissions được filter theo teams
- Task assignment restricted theo team membership

## 🛠️ Technical Implementation

### Files Structure
```
/
├── auth/
│   └── login.html          # Login page
├── assets/
│   └── js/
│       └── auth.js         # Authentication system
├── index.html              # Home page with module access
├── Task-Management.html    # Task management with auth integration
└── Authentication-Setup-Guide.md
```

### Key Components

#### 1. AuthManager Class (`assets/js/auth.js`)
- Session management
- Permission calculation
- Token validation
- Activity tracking

#### 2. Login Page (`auth/login.html`)
- Username/password form
- Remember me functionality
- Demo account info
- Session timeout handling

#### 3. Task Management Integration
- User info display in header
- Permission-based UI updates
- Filtered task access
- Role-based approval workflow

## 🔄 Workflow Integration

### Task Approval Permissions

#### Personal Tasks (level: 'personal')
- **Approvers:** PM/PO of the task's team
- **Condition:** Task progress = 100%
- **Scope:** Only within approver's teams

#### Monthly Tasks (level: 'monthly')
- **Approvers:** CPO
- **Condition:** Task progress = 100%
- **Scope:** All teams

#### Main Tasks (level: 'task')
- **Auto-calculated:** No manual approval needed
- **Updates:** Based on children progress

### Permission Checks
```javascript
// Check if user can approve task
if (authManager.canApproveTask(task)) {
    // Show approve button
}

// Check if user can assign task
if (authManager.canAssignToUser(assignee, team)) {
    // Allow assignment
}

// Filter tasks by permissions
const visibleTasks = authManager.filterTasksByPermissions(allTasks);
```

## 🚨 Security Features

### Session Security
- 15-minute timeout
- Activity-based renewal
- Secure token storage
- Auto-logout on timeout

### Permission Enforcement
- Server-side validation (when backend implemented)
- Client-side UI restrictions
- Role-based data filtering
- Team-based access control

### Data Protection
- User data stored in localStorage
- Token-based authentication
- Permission validation on every action

## 🔮 Next Steps

### Phase 2 - Backend Integration
1. **Real Authentication API**
   - Replace demo accounts with real user database
   - JWT token implementation
   - Password hashing and validation

2. **Database Integration**
   - User management database
   - Role and permission tables
   - Team membership tracking

3. **Enhanced Security**
   - Password policies
   - Account lockout
   - Audit logging
   - 2FA support (future)

### Phase 3 - Advanced Features
1. **User Management UI**
   - Admin interface for user CRUD
   - Role assignment interface
   - Team management

2. **Advanced Permissions**
   - Granular permissions
   - Custom role creation
   - Permission inheritance

## 📞 Support

### Demo Account Issues
- Nếu không đăng nhập được, check console for errors
- Clear localStorage nếu có vấn đề session
- Refresh page và thử lại

### Permission Issues
- Check user role và teams trong user info
- Verify permissions trong browser console
- Contact admin nếu cần thay đổi permissions

### Technical Issues
- Check browser console for JavaScript errors
- Ensure all files are in correct directories
- Verify file paths in HTML includes

---

**Tạo:** 2025-01-26  
**Cập nhật:** 2025-01-26  
**Trạng thái:** Ready for Testing
