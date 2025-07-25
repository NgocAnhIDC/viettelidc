# 👥 KPI TT Cloud - Roles & Permissions Matrix

## 📋 **Tổng quan**

Hệ thống KPI TT Cloud hiện có **14 roles** được định nghĩa theo BRD, phù hợp với cấu trúc tổ chức và quy trình làm việc của Trung tâm Cloud.

## 🔐 **Roles & Permissions Matrix**

| ID | Role Code | Role Name | Description | Permissions | Scope |
|----|-----------|-----------|-------------|-------------|-------|
| 1 | ADMIN | Admin | System Administrator | View, Create, Edit, Delete, Approve, Import, DeleteAll | All |
| 2 | CPO | CPO | Chief Product Officer | View, Edit, Approve, Import | All |
| 3 | PM | PM | Project Manager | View, Create, Edit, Approve, Import | Team |
| 4 | PO | PO | Product Owner | View, Create, Edit | Team |
| 5 | DEV | Developer | Software Developer | View | Own |
| 6 | TESTER | Tester | Quality Assurance | View | Team |
| 7 | BA | BA | Business Analyst | View | All |
| 8 | SO | SO | System Operator | View | Own |
| 9 | DEVOPS | DevOps | Developer Operations | View | All |
| 10 | BD | BD | Business Development | View, Create, Edit | Function |
| 11 | NV_DAU_TU | NV Đầu tư | Nhân viên Đầu tư | View, Create, Edit | Function |
| 12 | SM | SM | Scrum Master | View, Create, Edit, Delete | Function |
| 13 | TRUONG_BU | Trưởng BU | Trưởng Business Unit | View, Create, Edit, Delete, Approve, Import | Function |
| 14 | HANH_CHINH | Hành chính tổng hợp | Hành chính tổng hợp | View, Create, Edit, Delete, Import | Function |

## 🎯 **Permission Definitions**

### Core Permissions
- **View**: Xem dữ liệu và báo cáo
- **Create**: Tạo mới tasks, users, data
- **Edit**: Chỉnh sửa thông tin
- **Delete**: Xóa dữ liệu (soft delete)
- **Approve**: Phê duyệt tasks, KPIs
- **Import**: Import dữ liệu từ file
- **DeleteAll**: Xóa hàng loạt (Admin only)

### Scope Definitions
- **All**: Toàn hệ thống, tất cả teams
- **Team**: Chỉ trong team được assign
- **Own**: Chỉ dữ liệu của bản thân
- **Function**: Theo chức năng/phòng ban

## 🏢 **Role Hierarchy & Usage**

### **Management Level**
- **Admin**: Quản trị hệ thống, full permissions
- **CPO**: Lãnh đạo cao nhất, oversight toàn bộ
- **Trưởng BU**: Quản lý business unit

### **Team Level**
- **PM**: Quản lý dự án, team leadership
- **PO**: Product ownership, requirements
- **SM**: Scrum process management

### **Technical Level**
- **DEV**: Developers, engineers
- **TESTER**: QA, testing specialists
- **DEVOPS**: Infrastructure, deployment
- **BA**: Business analysis

### **Business Level**
- **BD**: Business development
- **NV Đầu tư**: Investment analysis
- **Hành chính**: Administrative support

### **Operations Level**
- **SO**: System operations, monitoring

## 📊 **Permission Matrix Detail**

```json
{
  "ADMIN": {
    "canView": true, "canCreate": true, "canEdit": true, "canDelete": true,
    "canApprove": true, "canImport": true, "canDeleteAll": true, "scope": "all"
  },
  "CPO": {
    "canView": true, "canCreate": false, "canEdit": true, "canDelete": false,
    "canApprove": true, "canImport": true, "canDeleteAll": false, "scope": "all"
  },
  "PM": {
    "canView": true, "canCreate": true, "canEdit": true, "canDelete": false,
    "canApprove": true, "canImport": true, "canDeleteAll": false, "scope": "team"
  },
  "PO": {
    "canView": true, "canCreate": true, "canEdit": true, "canDelete": false,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "team"
  },
  "DEV": {
    "canView": true, "canCreate": false, "canEdit": false, "canDelete": false,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "own"
  },
  "TESTER": {
    "canView": true, "canCreate": false, "canEdit": false, "canDelete": false,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "team"
  },
  "BA": {
    "canView": true, "canCreate": false, "canEdit": false, "canDelete": false,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "all"
  },
  "SO": {
    "canView": true, "canCreate": false, "canEdit": false, "canDelete": false,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "own"
  },
  "DEVOPS": {
    "canView": true, "canCreate": false, "canEdit": false, "canDelete": false,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "all"
  },
  "BD": {
    "canView": true, "canCreate": true, "canEdit": true, "canDelete": false,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "function"
  },
  "NV_DAU_TU": {
    "canView": true, "canCreate": true, "canEdit": true, "canDelete": false,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "function"
  },
  "SM": {
    "canView": true, "canCreate": true, "canEdit": true, "canDelete": true,
    "canApprove": false, "canImport": false, "canDeleteAll": false, "scope": "function"
  },
  "TRUONG_BU": {
    "canView": true, "canCreate": true, "canEdit": true, "canDelete": true,
    "canApprove": true, "canImport": true, "canDeleteAll": false, "scope": "function"
  },
  "HANH_CHINH": {
    "canView": true, "canCreate": true, "canEdit": true, "canDelete": true,
    "canApprove": false, "canImport": true, "canDeleteAll": false, "scope": "function"
  }
}
```

## 🔄 **Multi-Role Support**

- Một user có thể có nhiều roles
- Permissions được merge (OR logic)
- Scope được expand theo role cao nhất
- Ví dụ: User có cả PM và BA → scope = "all" (từ BA)

## ✅ **Implementation Status**

- ✅ **Database**: 14 roles đã được tạo trong bảng `roles`
- ✅ **API**: Endpoints hỗ trợ role-based permissions
- ✅ **Frontend**: UI hiển thị roles trong form user management
- ✅ **Validation**: Permission checking trong tất cả operations

## 📝 **Notes**

1. **BRD Compliance**: Tất cả roles từ BRD đã được implement
2. **Extensible**: Dễ dàng thêm roles mới khi cần
3. **Flexible**: Permissions có thể điều chỉnh theo yêu cầu business
4. **Secure**: Role-based access control được enforce ở API level
