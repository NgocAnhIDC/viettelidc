# 📋 Roles & Teams Reference cho Import CSV

## 👥 **ROLES (14 roles)**

| ID | Code | Name | Description |
|----|------|------|-------------|
| 1 | ADMIN | Admin | System Administrator |
| 2 | CPO | CPO | Chief Product Officer |
| 3 | PM | PM | Project Manager |
| 4 | PO | PO | Product Owner |
| 5 | DEV | Developer | Software Developer |
| 6 | TESTER | Tester | Quality Assurance |
| 7 | BA | BA | Business Analyst |
| 8 | SO | SO | System Operator |
| 9 | DEVOPS | DevOps | Developer Operations |
| 10 | BD | BD | Business Development |
| 11 | NV_DAU_TU | NV Đầu tư | Nhân viên Đầu tư |
| 12 | SM | SM | Scrum Master |
| 13 | TRUONG_BU | Trưởng BU | Trưởng Business Unit |
| 14 | HANH_CHINH | Hành chính tổng hợp | Hành chính tổng hợp |

## 🏢 **TEAMS (14 teams)**

### **IaaS Layer (Teams 1-5)**
| ID | Code | Name | Layer |
|----|------|------|-------|
| 1 | T01 | Team 1 - Public Cloud Vmware | IaaS |
| 2 | T02 | Team 2 - Public Cloud Openstack | IaaS |
| 3 | T03 | Team 3 - Private Cloud | IaaS |
| 4 | T04 | Team 4 - Storage | IaaS |
| 5 | T05 | Team 5 - Network | IaaS |

### **PaaS Layer (Teams 6-10)**
| ID | Code | Name | Layer |
|----|------|------|-------|
| 6 | T06 | Team 6 - DevOps | PaaS |
| 7 | T07 | Team 7 - K8S | PaaS |
| 8 | T08 | Team 8 - DB | PaaS |
| 9 | T09 | Team 9 - Cloudwatch | PaaS |
| 10 | T10 | Team 10 - CMP | PaaS |

### **Software Layer (Teams 11-13)**
| ID | Code | Name | Layer |
|----|------|------|-------|
| 11 | T11 | Team 11 - ATM | Software |
| 12 | T12 | Team 12 - CRM | Software |
| 13 | T13 | Team 13 - DMP | Software |

### **Manage Layer (Team 14)**
| ID | Code | Name | Layer |
|----|------|------|-------|
| 14 | T14 | Team 14 - Manage | Manage |

## 📝 **Cách sử dụng trong CSV:**

### **Một role/team:**
```csv
username,full_name,email,phone,password,roles,teams
user1,Nguyen Van A,user1@viettelidc.com,0123456789,pass123,5,1
```
- `roles: 5` = DEV
- `teams: 1` = Team 1 - Public Cloud Vmware

### **Nhiều roles/teams:**
```csv
username,full_name,email,phone,password,roles,teams
user2,Tran Thi B,user2@viettelidc.com,0987654321,pass123,"1,5","1,11"
```
- `roles: "1,5"` = Admin + DEV
- `teams: "1,11"` = Team 1 + Team 11

### **Ví dụ thực tế:**
```csv
username,full_name,email,phone,password,roles,teams
pmuser,Le Van PM,pm@viettelidc.com,0111222333,pm123,"3,7","6,7"
devuser,Pham Thi Dev,dev@viettelidc.com,0444555666,dev123,5,"11,12"
qauser,Hoang Van QA,qa@viettelidc.com,0777888999,qa123,6,13
```

## 🎯 **Lưu ý quan trọng:**

1. **Dấu ngoặc kép**: Bắt buộc khi có nhiều ID `"1,3,5"`
2. **Không có space**: Sau dấu phẩy `"1,3,5"` không phải `"1, 3, 5"`
3. **ID phải tồn tại**: Sử dụng đúng ID từ bảng trên
4. **Có thể để trống**: Cột roles và teams có thể bỏ trống
