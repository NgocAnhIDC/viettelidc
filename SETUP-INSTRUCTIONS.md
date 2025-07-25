# 🚀 KPI TT Cloud - MySQL Setup Instructions

## ✅ **Bước 1: Cài đặt XAMPP**

1. **Download XAMPP**:
   - Truy cập: https://www.apachefriends.org/download.html
   - Download "XAMPP for Windows" (PHP 8.x)
   - File size: ~150MB

2. **Cài đặt XAMPP**:
   - Chạy file installer đã download
   - Chọn components: **Apache**, **MySQL**, **phpMyAdmin**
   - Install path: `C:\xampp` (default)
   - Hoàn tất cài đặt

## ✅ **Bước 2: Khởi động MySQL**

1. **Mở XAMPP Control Panel**:
   - Start Menu → XAMPP → XAMPP Control Panel
   - Hoặc chạy: `C:\xampp\xampp-control.exe`

2. **Start MySQL Service**:
   - Click nút **"Start"** bên cạnh MySQL
   - Đợi đến khi status hiển thị màu xanh
   - Port 3306 sẽ được hiển thị

## ✅ **Bước 3: Setup Database**

1. **Chạy script tự động**:
   ```bash
   # Trong thư mục ViettelIDC
   setup-database.bat
   ```

2. **Hoặc setup thủ công**:
   - Truy cập: http://localhost/phpmyadmin
   - Tạo database mới: `users_db`
   - Import file: `database/users_db_schema.sql`

## ✅ **Bước 4: Khởi động API**

1. **Mở terminal trong thư mục api**:
   ```bash
   cd api
   npm start
   ```

2. **Kiểm tra kết nối**:
   - API sẽ hiển thị: "Connected to users_db database"
   - Server running on: http://localhost:3001

## ✅ **Bước 5: Test User Management**

1. **Mở User Management**:
   - Truy cập: `User-Management.html`
   - Không còn redirect về login page
   - API authentication hoạt động

2. **Test với demo account**:
   - Username: `admin`
   - Password: `admin123`
   - Hoặc sử dụng demo mode như trước

## 🔧 **Troubleshooting**

### MySQL không start được:
```bash
# Kiểm tra port 3306 có bị chiếm không
netstat -an | find "3306"

# Nếu bị chiếm, kill process hoặc đổi port
```

### Database connection failed:
```bash
# Kiểm tra MySQL service
net start mysql

# Kiểm tra config trong api/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=users_db
```

### API vẫn báo lỗi:
```bash
# Restart API
cd api
npm start

# Kiểm tra logs để xem lỗi cụ thể
```

## 📋 **Verification Checklist**

- [ ] XAMPP đã cài đặt thành công
- [ ] MySQL service đang chạy (port 3306)
- [ ] Database `users_db` đã được tạo
- [ ] Tables đã được import (users, roles, teams, etc.)
- [ ] API khởi động thành công (port 3001)
- [ ] User Management không redirect về login
- [ ] Authentication hoạt động với API

## 🎯 **Kết quả mong đợi**

Sau khi hoàn thành:
- ✅ MySQL database hoạt động
- ✅ API kết nối database thành công
- ✅ User Management sử dụng real authentication
- ✅ Không còn phụ thuộc vào demo mode
- ✅ Có thể CRUD users thông qua API

## 📞 **Hỗ trợ**

Nếu gặp vấn đề, hãy:
1. Kiểm tra XAMPP Control Panel
2. Xem logs trong terminal API
3. Kiểm tra file `.env` trong thư mục api
4. Test database connection qua phpMyAdmin
