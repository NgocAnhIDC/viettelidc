# MySQL Setup Guide for KPI TT Cloud

## 🔧 Cài đặt MySQL Server

### Option 1: MySQL Installer (Recommended)
1. **Download MySQL Installer**:
   - Truy cập: https://dev.mysql.com/downloads/installer/
   - Chọn "mysql-installer-community-8.0.xx.x.msi"
   - Download và chạy installer

2. **Cài đặt MySQL**:
   - Chọn "Developer Default" setup type
   - Hoặc "Custom" và chọn:
     - MySQL Server 8.0.xx
     - MySQL Workbench 8.0.xx
     - MySQL Shell 8.0.xx

3. **Cấu hình MySQL Server**:
   - **Config Type**: Development Computer
   - **Connectivity**: 
     - Port: 3306 (default)
     - Open Windows Firewall: Yes
   - **Authentication Method**: Use Strong Password Encryption
   - **Accounts and Roles**:
     - Root Password: `admin123` (hoặc password bạn muốn)
     - Tạo user account: `kpi_user` / password: `kpi123`

### Option 2: XAMPP (Easier for development)
1. **Download XAMPP**:
   - Truy cập: https://www.apachefriends.org/download.html
   - Download XAMPP for Windows

2. **Cài đặt XAMPP**:
   - Chạy installer
   - Chọn components: Apache, MySQL, phpMyAdmin
   - Install vào `C:\xampp`

3. **Khởi động MySQL**:
   - Mở XAMPP Control Panel
   - Click "Start" cho MySQL
   - MySQL sẽ chạy trên port 3306

## 🗄️ Tạo Database và Import Schema

### Sử dụng MySQL Command Line:
```bash
# Kết nối MySQL
mysql -u root -p

# Tạo database và import schema
source C:\Users\Administrator\Documents\ViettelIDC\database\users_db_schema.sql
```

### Sử dụng MySQL Workbench:
1. Mở MySQL Workbench
2. Kết nối đến MySQL Server (localhost:3306)
3. File → Open SQL Script
4. Chọn file: `database/users_db_schema.sql`
5. Execute script

### Sử dụng phpMyAdmin (nếu dùng XAMPP):
1. Truy cập: http://localhost/phpmyadmin
2. Tạo database mới: `users_db`
3. Import file SQL: `database/users_db_schema.sql`

## ⚙️ Cấu hình API Connection

### Tạo file .env trong thư mục api:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin123
DB_NAME=users_db

# JWT Configuration
JWT_SECRET=kpi-tt-cloud-secret-key-2024

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Kiểm tra kết nối:
```bash
cd api
npm test
```

## 🚀 Khởi động hệ thống

### 1. Khởi động MySQL:
- **MySQL Service**: Đảm bảo MySQL service đang chạy
- **XAMPP**: Start MySQL trong XAMPP Control Panel

### 2. Khởi động API:
```bash
cd api
npm start
```

### 3. Kiểm tra:
- API: http://localhost:3001
- Database: Kết nối thành công
- User Management: Không còn redirect về login

## 🔍 Troubleshooting

### Lỗi "ECONNREFUSED":
- Kiểm tra MySQL service có chạy không
- Kiểm tra port 3306 có bị block không
- Kiểm tra username/password trong config

### Lỗi "Access denied":
- Kiểm tra username/password
- Tạo user mới với quyền phù hợp
- Reset root password nếu cần

### Lỗi "Database not found":
- Import lại schema SQL
- Kiểm tra tên database trong config

## 📝 Quick Commands

```bash
# Kiểm tra MySQL service
net start mysql80

# Kết nối MySQL
mysql -u root -p

# Kiểm tra databases
SHOW DATABASES;

# Sử dụng database
USE users_db;

# Kiểm tra tables
SHOW TABLES;

# Kiểm tra users
SELECT * FROM users LIMIT 5;
```
