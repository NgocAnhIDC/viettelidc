# 👥 Hướng dẫn sử dụng tính năng User Management

## 🎯 Tổng quan

Hệ thống KPI TT Cloud User Management đã được nâng cấp với đầy đủ tính năng CRUD (Create, Read, Update, Delete) cho quản lý người dùng.

## ✨ Tính năng mới

### 1. **Thêm người dùng mới**
- **Truy cập**: Nhấn nút "Thêm người dùng" trên trang User Management
- **Thông tin bắt buộc**:
  - Tên đăng nhập (username)
  - Họ và tên (full_name)
  - Mật khẩu (password)
- **Thông tin tùy chọn**:
  - Email
  - Số điện thoại
  - Ngày vào làm
  - Vai trò (roles)
  - Nhóm làm việc (teams)

### 2. **Chỉnh sửa người dùng**
- **Truy cập**: Nhấn nút "Sửa" trên hàng người dùng cần chỉnh sửa
- **Có thể chỉnh sửa**:
  - Tất cả thông tin cơ bản
  - Trạng thái hoạt động
  - Ngày nghỉ việc
  - Vai trò và nhóm làm việc
- **Lưu ý**: Không thể thay đổi mật khẩu qua form chỉnh sửa

### 3. **Xóa người dùng**
- **Truy cập**: Nhấn nút "Xóa" trên hàng người dùng cần xóa
- **Cơ chế**: Soft delete (đặt is_active = false)
- **Xác nhận**: Yêu cầu xác nhận trước khi xóa

### 4. **Import người dùng từ file CSV**
- **Truy cập**: Nhấn nút "Import từ file"
- **Định dạng**: Chỉ chấp nhận file CSV (.csv)
- **Kích thước**: Tối đa 5MB
- **Cột bắt buộc**: username, full_name, password
- **Cột tùy chọn**: email, phone, roles (ID), teams (ID)
- **Template**: Tải template mẫu để xem định dạng chính xác

### 5. **Xóa tất cả người dùng (Admin only)**
- **Truy cập**: Nút "Xóa tất cả" (chỉ hiển thị cho Admin)
- **Bảo vệ**: Không xóa tài khoản admin (id = 1)
- **Xác nhận**: Yêu cầu nhập "DELETE ALL" để xác nhận
- **Cơ chế**: Soft delete tất cả user trừ admin

## 🔧 API Endpoints mới

### Authentication Required
Tất cả API endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

### User CRUD Operations

#### 1. Tạo người dùng mới
```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "full_name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "join_date": "2025-01-01",
  "roles": [1, 2],
  "teams": [1, 3]
}
```

#### 2. Cập nhật người dùng
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "username": "updateduser",
  "full_name": "Nguyễn Văn B",
  "email": "updated@example.com",
  "phone": "0987654321",
  "is_active": true,
  "leave_date": null,
  "roles": [1],
  "teams": [2, 3]
}
```

#### 3. Xóa người dùng (Soft Delete)
```http
DELETE /api/users/{id}
```

#### 4. Lấy thông tin chi tiết người dùng
```http
GET /api/users/{id}
```

#### 5. Import người dùng từ CSV
```http
POST /api/users/import
Content-Type: multipart/form-data

Form data:
- file: CSV file
```

#### 6. Xóa tất cả người dùng (Admin only)
```http
DELETE /api/users/bulk/all
```

#### 7. Tải template import
```http
GET /api/users/import/template
```

## 🎨 Giao diện người dùng

### Modal Form
- **Responsive design**: Tự động điều chỉnh trên mobile
- **Validation real-time**: Hiển thị lỗi ngay khi nhập
- **Multi-select**: Chọn nhiều vai trò và nhóm làm việc
- **Dark theme**: Phù hợp với thiết kế tổng thể

### Form Fields
- **Username**: Chỉ chấp nhận chữ cái, số và dấu gạch dưới
- **Email**: Validation định dạng email
- **Phone**: Validation số điện thoại
- **Password**: Tối thiểu 6 ký tự (chỉ khi tạo mới)
- **Roles/Teams**: Multi-select dropdown

## 🔒 Phân quyền

### Quyền truy cập
- **canView**: Xem danh sách người dùng
- **canCreate**: Tạo người dùng mới
- **canEdit**: Chỉnh sửa thông tin người dùng
- **canDelete**: Xóa người dùng

### Roles mặc định
- **Admin**: Toàn quyền
- **CPO**: Toàn quyền
- **PM/PO**: Xem và chỉnh sửa
- **Dev**: Chỉ xem
- **SO**: Chỉ xem

## 🧪 Testing

### 1. Test API
- Sử dụng file `test-user-api.html` để test các API endpoints
- Truy cập: `http://localhost/test-user-api.html`

### 2. Test UI
1. Đăng nhập với tài khoản admin
2. Truy cập User Management
3. Test các tính năng:
   - Thêm người dùng mới
   - Chỉnh sửa người dùng
   - Xóa người dùng
   - Validation form

## 🚀 Cách sử dụng

### Bước 1: Khởi động hệ thống
```bash
# Khởi động API
cd api
npm start

# Khởi động web server (port 80)
# Hoặc sử dụng Docker
```

### Bước 2: Đăng nhập
- Truy cập: `http://localhost/auth/login.html`
- Sử dụng tài khoản admin: `admin/admin123`

### Bước 3: Quản lý người dùng
- Truy cập: User Management từ menu
- Sử dụng các tính năng CRUD

## 🔍 Troubleshooting

### Lỗi thường gặp

#### 1. "Failed to fetch user data"
- **Nguyên nhân**: API không chạy hoặc token hết hạn
- **Giải pháp**: Kiểm tra API và đăng nhập lại

#### 2. "Username already exists"
- **Nguyên nhân**: Tên đăng nhập đã tồn tại
- **Giải pháp**: Sử dụng tên đăng nhập khác

#### 3. "Validation errors"
- **Nguyên nhân**: Dữ liệu nhập không hợp lệ
- **Giải pháp**: Kiểm tra và sửa theo thông báo lỗi

### Debug
- Mở Developer Tools (F12)
- Kiểm tra Console tab để xem lỗi chi tiết
- Kiểm tra Network tab để xem API calls

## 📝 Changelog

### Version 2.0 (Current)
- ✅ Thêm tính năng Create User
- ✅ Thêm tính năng Edit User  
- ✅ Thêm tính năng Delete User
- ✅ Form validation
- ✅ Modal UI
- ✅ API endpoints
- ✅ Error handling
- ✅ Success notifications

### Planned Features
- [ ] Bulk user import/export
- [ ] Password reset functionality
- [ ] User activity logs
- [ ] Advanced filtering
- [ ] User profile pictures

## 🤝 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs
2. Kiểm tra API health: `http://localhost:3001/api/health`
3. Sử dụng test page để debug API
4. Liên hệ team phát triển
