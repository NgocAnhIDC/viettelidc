# 🏢 Hướng dẫn Quản lý Teams - KPI TT Cloud

## 📋 Tổng quan

Hệ thống KPI TT Cloud sử dụng **Configuration File** để quản lý 14 teams theo 4 layers, phù hợp với tần suất thay đổi **1 năm/lần**.

### ✅ Ưu điểm của phương án này:
- **Đơn giản**: Chỉ cần edit file JSON
- **Backup dễ dàng**: Copy file là xong
- **Version control**: Track changes qua Git
- **Không phụ thuộc database**: Hoạt động độc lập
- **Restart nhanh**: Áp dụng thay đổi trong 30 giây

## 📁 Cấu trúc File

### Vị trí file cấu hình:
```
api/config/teams.json
```

### Cấu trúc JSON:
```json
{
  "teams": [
    {
      "id": 1,
      "team_code": "T1",
      "team_name": "Team 1 - Public Cloud Vmware",
      "layer": "IaaS",
      "description": "VMware Infrastructure",
      "manager_id": null,
      "is_active": true
    }
  ],
  "layers": [
    {
      "id": 1,
      "layer_code": "IaaS",
      "layer_name": "Infrastructure as a Service",
      "description": "Cơ sở hạ tầng dịch vụ",
      "order": 1
    }
  ],
  "metadata": {
    "version": "1.0",
    "last_updated": "2024-12-17",
    "updated_by": "admin",
    "description": "KPI TT Cloud System Teams Configuration"
  }
}
```

## 🔧 Cách thay đổi Teams

### 1. Backup trước khi thay đổi
```bash
# Tạo backup với timestamp
cp api/config/teams.json api/config/teams_backup_$(date +%Y%m%d_%H%M%S).json
```

### 2. Chỉnh sửa file teams.json
```bash
# Mở file bằng editor
notepad api/config/teams.json
# hoặc
code api/config/teams.json
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
- Click "Thêm người dùng" → Kiểm tra dropdown Teams
- Console log sẽ hiển thị: `Loaded X teams`

## 📝 Các thao tác thường dùng

### ➕ Thêm Team mới
```json
{
  "id": 15,
  "team_code": "T15",
  "team_name": "Team 15 - New Team",
  "layer": "Software",
  "description": "Mô tả team mới",
  "manager_id": null,
  "is_active": true
}
```

### ✏️ Sửa Team hiện có
- Thay đổi `team_name`, `description`
- Cập nhật `layer` nếu cần
- Thay đổi `manager_id` khi có PM/PO

### 🚫 Vô hiệu hóa Team
```json
{
  "is_active": false
}
```

### 🗑️ Xóa Team
- Xóa toàn bộ object khỏi array `teams`
- **Lưu ý**: Kiểm tra không có user nào đang thuộc team này

### ➕ Thêm Layer mới
```json
{
  "id": 5,
  "layer_code": "NEW_LAYER",
  "layer_name": "New Layer Name",
  "description": "Mô tả layer mới",
  "order": 5
}
```

## 🎯 Layers và Team Structure

### Layers (4 lớp):
1. **IaaS** - Infrastructure as a Service (Teams 1-5)
2. **PaaS** - Platform as a Service (Teams 6-10)
3. **Software** - Software Development (Teams 11-13)
4. **Manage** - Management (Team 14)

### Team Properties:
- `id`: Unique identifier (integer)
- `team_code`: Mã team (T1, T2, ...)
- `team_name`: Tên đầy đủ của team
- `layer`: Thuộc layer nào (IaaS, PaaS, Software, Manage)
- `description`: Mô tả chức năng team
- `manager_id`: ID của PM/PO (null nếu chưa có)
- `is_active`: Trạng thái hoạt động

## ⚠️ Lưu ý quan trọng

### 🔒 Bảo mật:
- **Luôn backup** trước khi thay đổi
- **Không xóa Team 14** - Team quản lý quan trọng
- **Kiểm tra syntax JSON** trước khi save

### 🔄 Quy trình thay đổi:
1. **Backup** file hiện tại
2. **Edit** file teams.json
3. **Validate** JSON syntax
4. **Restart** API server
5. **Test** trên UI
6. **Commit** vào Git (nếu có)

### 🚨 Troubleshooting:

**Lỗi: API không start được**
- Kiểm tra syntax JSON: https://jsonlint.com/
- Restore từ backup file

**Lỗi: Teams không hiển thị**
- Kiểm tra `is_active: true`
- Kiểm tra console log API server

**Lỗi: User không tạo được**
- Kiểm tra team mapping trong `getTeamNames()` function
- Đảm bảo team ID tồn tại

## 📊 Danh sách Teams hiện tại (Cập nhật mới)

### VMW Layer (3 teams):
- **T1**: Cloud VCF (CVCF)
- **T2**: Cloud Storage & Data Protection (CSDP)
- **T3**: Cloud Network & Security (CNS)

### OPS Layer (4 teams):
- **T4**: Open Cloud
- **T5**: Open Platform
- **T6**: CMP
- **T7**: DepOps

### SaaS Layer (3 teams):
- **T8**: Productivity
- **T9**: MultiCDN
- **T10**: Cloud Camera

### CĐS Layer (3 teams):
- **T11**: BSS
- **T12**: OSS
- **T13**: DMP

### KHSP Layer (1 team):
- **T14**: Support

## 🛠️ Script tiện ích

Sử dụng script PowerShell để quản lý teams:

```powershell
# Tạo backup
.\scripts\manage-teams.ps1 backup

# Validate file
.\scripts\manage-teams.ps1 validate

# Liệt kê teams
.\scripts\manage-teams.ps1 list

# Restore từ backup
.\scripts\manage-teams.ps1 restore teams_backup_20241217_143022.json
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra console log API server
2. Restore từ backup file
3. Liên hệ admin hệ thống

---
**Cập nhật lần cuối**: 2024-12-17  
**Phiên bản**: 1.0  
**Tác giả**: KPI TT Cloud Team
