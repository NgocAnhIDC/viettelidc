# 🛡️ Hướng dẫn Quản lý Vai trò - KPI TT Cloud

## 📋 Tổng quan

Hệ thống KPI TT Cloud sử dụng **Configuration File** để quản lý roles, phù hợp với tần suất thay đổi **1 năm/lần**.

### ✅ Ưu điểm của phương án này:
- **Đơn giản**: Chỉ cần edit file JSON
- **Backup dễ dàng**: Copy file là xong
- **Version control**: Track changes qua Git
- **Không phụ thuộc database**: Hoạt động độc lập
- **Restart nhanh**: Áp dụng thay đổi trong 30 giây

## 📁 Cấu trúc File

### Vị trí file cấu hình:
```
api/config/roles.json
```

### Cấu trúc JSON:
```json
{
  "roles": [
    {
      "id": 1,
      "role_code": "ADMIN",
      "role_name": "Admin",
      "description": "System Administrator",
      "category": "Management",
      "permissions": {
        "canView": true,
        "canCreate": true,
        "canEdit": true,
        "canDelete": true,
        "canApprove": true,
        "canImport": true,
        "scope": "all"
      },
      "is_active": true
    }
  ],
  "metadata": {
    "version": "1.0",
    "last_updated": "2024-12-17",
    "updated_by": "admin",
    "description": "KPI TT Cloud System Roles Configuration"
  }
}
```

## 🔧 Cách thay đổi Roles

### 1. Backup trước khi thay đổi
```bash
# Tạo backup với timestamp
cp api/config/roles.json api/config/roles_backup_$(date +%Y%m%d_%H%M%S).json
```

### 2. Chỉnh sửa file roles.json
```bash
# Mở file bằng editor
notepad api/config/roles.json
# hoặc
code api/config/roles.json
```

### 3. Restart API Server
```bash
# Stop current server (Ctrl+C)
# Start lại
cd api
node basic-server.js
```

### 4. Kiểm tra thay đổi
- Mở User Management: http://localhost:8080/User-Management.html
- Click "Thêm người dùng" → Kiểm tra dropdown Roles
- Console log sẽ hiển thị: `Loaded X roles`

## 📝 Các thao tác thường dùng

### ➕ Thêm Role mới
```json
{
  "id": 15,
  "role_code": "NEW_ROLE",
  "role_name": "Vai trò mới",
  "description": "Mô tả vai trò mới",
  "category": "Development & Operations",
  "permissions": {
    "canView": true,
    "canCreate": false,
    "canEdit": false,
    "canDelete": false,
    "canApprove": false,
    "canImport": false,
    "scope": "team"
  },
  "is_active": true
}
```

### ✏️ Sửa Role hiện có
- Thay đổi `role_name`, `description`
- Cập nhật `permissions`
- Thay đổi `category` nếu cần

### 🚫 Vô hiệu hóa Role
```json
{
  "is_active": false
}
```

### 🗑️ Xóa Role
- Xóa toàn bộ object khỏi array `roles`
- **Lưu ý**: Kiểm tra không có user nào đang sử dụng role này

## 🎯 Categories và Permissions

### Categories (Danh mục):
- `"Management"` - Quản lý cấp cao
- `"Product & Project Management"` - Quản lý sản phẩm & dự án
- `"Development & Operations"` - Phát triển & vận hành
- `"Business & Support"` - Kinh doanh & hỗ trợ

### Permissions (Quyền hạn):
- `canView`: Xem dữ liệu
- `canCreate`: Tạo mới
- `canEdit`: Chỉnh sửa
- `canDelete`: Xóa
- `canApprove`: Phê duyệt
- `canImport`: Import dữ liệu

### Scope (Phạm vi):
- `"all"`: Toàn hệ thống
- `"team"`: Chỉ team được assign
- `"function"`: Theo chức năng nghiệp vụ

## ⚠️ Lưu ý quan trọng

### 🔒 Bảo mật:
- **Luôn backup** trước khi thay đổi
- **Không xóa role ADMIN** - Sẽ làm hỏng hệ thống
- **Kiểm tra syntax JSON** trước khi save

### 🔄 Quy trình thay đổi:
1. **Backup** file hiện tại
2. **Edit** file roles.json
3. **Validate** JSON syntax
4. **Restart** API server
5. **Test** trên UI
6. **Commit** vào Git (nếu có)

### 🚨 Troubleshooting:

**Lỗi: API không start được**
- Kiểm tra syntax JSON: https://jsonlint.com/
- Restore từ backup file

**Lỗi: Roles không hiển thị**
- Kiểm tra `is_active: true`
- Kiểm tra console log API server

**Lỗi: User không tạo được**
- Kiểm tra role mapping trong `getRoleNames()` function
- Đảm bảo role ID tồn tại

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra console log API server
2. Restore từ backup file
3. Liên hệ admin hệ thống

---
**Cập nhật lần cuối**: 2024-12-17  
**Phiên bản**: 1.0  
**Tác giả**: KPI TT Cloud Team
