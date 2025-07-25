# 📋 KPI TT Cloud - Business Requirements Document

## 📖 Tổng quan Hệ thống

**Tên hệ thống:** KPI TT Cloud  
**Mục đích:** Quản lý và đánh giá hiệu suất làm việc của 14 teams agile thuộc Trung tâm Cloud  
**Phạm vi:** Quản lý công việc, doanh thu, chất lượng dịch vụ, đào tạo, tuân thủ và tính toán KPI  
**Người dùng:** 500 concurrent users  

---

## 🏢 Cấu trúc Tổ chức

### Hierarchy
- **CPO (Chief Product Officer)** → **Agile Teams** (PM, PO, Team members)

### 14 Teams Agile (4 Layers) - Chi tiết

#### VMW Layer (Vmware)
| Team ID | Team Code | Team Name | Description |
|---------|-----------|-----------|-------------|
| 1 | T1 | Cloud VCF (CVCF) | Cloud VCF Team |
| 2 | T2 | Cloud Storage & Data Protection (CSDP) | Cloud Storage & Data Protection |
| 3 | T3 | Cloud Network & Security (CNS) | Cloud Network & Security |

#### OPS Layer (Openstack)
| Team ID | Team Code | Team Name | Description |
|---------|-----------|-----------|-------------|
| 4 | T4 | Open Cloud | Open Cloud |
| 5 | T5 | Open Platform | Open Platform |
| 6 | T6 | CMP | CMP |
| 7 | T7 | DepOps | DepOps |

#### SaaS Layer (Software as a Service)
| Team ID | Team Code | Team Name | Description |
|---------|-----------|-----------|-------------|
| 8 | T8 | Productivity | Productivity |
| 9 | T9 | MultiCDN | MultiCDN |
| 10 | T10 | Cloud Camera | Cloud Camera |

#### CĐS Layer (Chuyển đổi số)
| Team ID | Team Code | Team Name | Description |
|---------|-----------|-----------|-------------|
| 11 | T11 | BSS | BSS |
| 12 | T12 | OSS | OSS |
| 13 | T13 | DMP | DMP |

#### KHSP Layer (Support)
| Team ID | Team Code | Team Name | Description |
|---------|-----------|-----------|-------------|
| 14 | T14 | Support | Support |

#### Layer Hierarchy (5 Layers)
- **Layer 1 - VMW**: Vmware (Teams 1-3)
- **Layer 2 - OPS**: Openstack (Teams 4-7)
- **Layer 3 - SaaS**: Software as a Service (Teams 8-10)
- **Layer 4 - CĐS**: Chuyển đổi số (Teams 11-13)
- **Layer 5 - KHSP**: Support (Team 14)

### Đặc điểm
- Một người có thể tham gia nhiều team
- Một người có thể có nhiều roles
- Team có PM, PO là leader

---

## 👥 User Management Requirements

### Roles và Permissions (14 Roles)

#### Management Roles
| Role Code | Role Name | Quyền | Phạm vi | Mô tả |
|-----------|-----------|-------|---------|-------|
| ADMIN | Admin | View, Create, Edit, Delete, Approve, Import | All | System Administrator |
| CPO | CPO | View, Edit, Approve, Import | All | Chief Product Officer |
| BU_LEAD | Trưởng BU | View, Create, Edit, Delete | Function | Business Unit Leader |

#### Product & Project Management
| Role Code | Role Name | Quyền | Phạm vi | Mô tả |
|-----------|-----------|-------|---------|-------|
| PM | PM | View, Create, Edit, Approve, Import | Team | Project Manager |
| PO | PO | View, Create, Edit, Approve, Import | Team | Product Owner |
| SM | SM | View, Create, Edit, Delete | Function | Scrum Master |
| BA | BA | View | All | Business Analyst |

#### Development & Operations
| Role Code | Role Name | Quyền | Phạm vi | Mô tả |
|-----------|-----------|-------|---------|-------|
| DEV | Dev | View | All | Developer |
| TESTER | Tester | View | All | Quality Assurance Tester |
| DEVOPS | DevOps | View | All | DevOps Engineer |
| SO | SO | View | All | System Operator |

#### Business & Support
| Role Code | Role Name | Quyền | Phạm vi | Mô tả |
|-----------|-----------|-------|---------|-------|
| BD | BD | View, Create, Edit | Function | Business Development |
| INV | NV Đầu tư | View, Create, Edit | Function | Investment Staff |
| ADMIN_STAFF | Hành chính tổng hợp | View, Create, Edit, Delete | Function | Administrative Staff |

#### Permission Scope Definitions
- **All**: Toàn hệ thống, tất cả teams
- **Team**: Chỉ team được assign
- **Function**: Theo chức năng nghiệp vụ cụ thể

### User Information
- **Bắt buộc:** Tên đăng nhập, Họ và tên, mật khẩu
- **Optional:** Email, số điện thoại, ngày vào làm, ngày nghỉ việc
- **Roles:** Multi-select từ 14 roles định nghĩa
- **Teams:** Multi-select từ 14 teams theo 4 layers
- **Lịch sử:** Quản lý lịch sử thay đổi thông tin
- **Tích hợp:** Chưa tích hợp HR/AD (future scope)

### User Management Features
**1. CRUD Operations**
- **Create:** Form modal với validation đầy đủ
- **Read:** Table view với search, filter, pagination
- **Update:** Edit modal với pre-filled data
- **Delete:** Multi-tier delete system (soft/hard)

**2. Bulk Operations**
- **Import:** CSV file upload với template download
- **Export:** Export user list to Excel/CSV
- **Bulk Delete:** Select multiple users để xóa
- **Bulk Update:** Mass update roles/teams (future scope)

**3. Advanced Features**
- **Search & Filter:** By username, name, role, team, status
- **Checkbox Selection:** Multi-select với "Select All"
- **Auto Refresh:** Tự động cập nhật sau operations
- **Responsive Design:** Mobile-friendly với icon-only buttons
- **Permission Control:** UI elements hiển thị theo quyền user

### Authentication
- **Đăng nhập:** Username/Password
- **Tính năng:** Remember me, Forgot password
- **Security:** Không cần 2FA
- **Session:** Timeout 15 phút từ hành động cuối

### User Lifecycle Management

#### Phân loại Delete Operations
**1. Soft Delete (Deactivate) - Mặc định**
- **Mục đích:** Vô hiệu hóa tạm thời, giữ lại data để audit
- **Use cases:** Nhân viên nghỉ việc, tạm ngưng hoạt động, chuyển bộ phận
- **Implementation:** `is_active = FALSE`, `leave_date = CURRENT_DATE`
- **Khôi phục:** Có thể reactivate bất cứ lúc nào
- **Permissions:** Admin, PM, CPO

**2. Hard Delete (Permanent) - Đặc biệt**
- **Mục đích:** Xóa hoàn toàn khỏi database
- **Use cases:** GDPR compliance, test accounts cleanup, data breach response
- **Implementation:** `DELETE FROM users WHERE id = ?`
- **Khôi phục:** Không thể khôi phục
- **Permissions:** Chỉ Admin
- **Confirmation:** Double confirmation + type "PERMANENT DELETE"

**3. Archive (Future scope)**
- **Mục đích:** Chuyển sang storage dài hạn
- **Use cases:** Sau 1-2 năm nghỉ việc
- **Implementation:** Move to `users_archived` table

#### Business Rules
- **Admin Protection:** Admin account (id = 1) không bao giờ được xóa
- **Default Behavior:** Mọi delete operation mặc định là Soft Delete
- **Audit Trail:** Log tất cả delete actions với timestamp và user thực hiện
- **Bulk Operations:** Support xóa nhiều users cùng lúc (selected hoặc all)
- **UI/UX:** Dropdown menu với các tùy chọn delete khác nhau

#### Data Retention Policy
- **Active users:** Indefinite retention
- **Deactivated users:** 2 years retention
- **Archived users:** 7 years retention (compliance)
- **Deleted users:** No retention (GDPR compliance)

#### Security & Monitoring
- **Role-based Access:** Chỉ Admin có quyền Hard Delete
- **Confirmation Levels:**
  - Soft Delete: Simple confirm dialog
  - Hard Delete: Double confirmation + type phrase
- **Alerts:** Mass deletion (>10 users), Admin account targeted
- **Backup:** Auto-backup before hard delete operations

---

## 📋 Task Management Requirements

### Cấu trúc Phân cấp (Configurable)
```
Nhiệm vụ
├── Công việc từng tháng
    └── Công việc cá nhân tháng
```

### Loại Công việc (Configurable)
- Nhiệm vụ trọng tâm (NVTT)
- Nhiệm vụ kế hoạch (NVKH)  
- CTHĐ (Chương trình hành động)
- TNKH (Trải nghiệm khách hàng)
- NetBI
- Đầu tư

### Task Information Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Mã Nhiệm vụ | Auto-generated | Yes | Team_abbreviation + indexes |
| Title | Text | Yes | Tên công việc |
| Team chủ trì | Dropdown | Yes | Chọn từ 14 teams |
| Tên sản phẩm/dịch vụ | Dropdown | No | Theo team |
| Loại công việc | Dropdown | Yes | Configurable list |
| Tính chất công việc | Dropdown | No | Sản phẩm mới, Tính năng mới, etc. |
| Mục tiêu | Text | No | Objective description |
| Công việc cha | Reference | Auto | Parent task reference |
| DoD | Text | Yes | Definition of Done |
| Người phụ trách | User | Yes | Assignee |
| Team/Người phối hợp | Multi-select | Yes | Collaborators |
| Ngày bắt đầu kế hoạch | Date | Yes | Planned start |
| Ngày hoàn thành kế hoạch | Date | Yes | Planned end |
| Ngày bắt đầu thực tế | Date | Yes | Actual start (auto for parents) |
| Ngày kết thúc thực tế | Date | Yes | Actual end (auto for parents) |
| Trạng thái | Auto | Yes | Based on progress % |
| Tiến độ | Percentage | Yes | Default 0% |
| Note/Điều chỉnh | Text | No | Comments |

### Workflow & Status
- **Trạng thái:** Chưa thực hiện (0%), Đang thực hiện (1-99%), Hoàn thành (100%)
- **Auto-calculation:** Parent status = average of children progress
- **Approval Flow:**
  - PM/PO approve "Công việc cá nhân tháng"
  - CPO approve "Công việc từng tháng"
  - "Nhiệm vụ" auto-update (no approval needed)

---

## 📋 Task Approval Workflow

### Approval Hierarchy
| Task Level | Approver | Trigger Condition |
|------------|----------|-------------------|
| Công việc cá nhân tháng | PM/PO | Progress reaches 100% |
| Công việc từng tháng | CPO | Progress reaches 100% |
| Nhiệm vụ | Auto-update | No approval needed |

### Approval Process Flow

#### 1. Task Completion Trigger
- **Personal Task (100%)** → Status: "Chờ phê duyệt" → Notify PM/PO
- **Monthly Task (100%)** → Status: "Chờ phê duyệt" → Notify CPO
- **Main Task** → Auto-calculated from children, no approval needed

#### 2. Approval Actions
- **Quick Approval**: One-click approve from task list
- **Detailed Review**: Edit task form with full approval section
- **Bulk Approval**: Select multiple tasks for batch approval

#### 3. Approval Permissions
- **PM/PO**: Can approve personal tasks within their teams only
- **CPO**: Can approve monthly tasks across all teams
- **Admin**: Can approve any task at any level

### Rejection Workflow

#### Rejection Options
1. **Simple Rejection**: Reject with reason, reset to "Đang thực hiện" (50% progress)
2. **Selective Rejection**: Choose specific child tasks to reset
3. **Complete Rejection**: Reset entire task hierarchy

#### Rejection Logic and Cascade Updates
- **Reject Personal Task**: Only affects the specific personal task
- **Reject Monthly Task**: Cascades to reset related personal tasks that are completed (100%)
- **Reject Task Level**: Cascades to reset all related monthly and personal tasks that are completed

#### Cascade Rules:
1. **Task Level Rejection**:
   - Find all monthly tasks under this task that are completed (100%)
   - Find all personal tasks under those monthly tasks that are completed (100%)
   - Reset all found tasks to "In Progress" status with reduced progress (-10%)
   - Display list of affected tasks to approver before confirmation

2. **Monthly Level Rejection**:
   - Find all personal tasks under this monthly task that are completed (100%)
   - Reset found personal tasks to "In Progress" status with reduced progress (-10%)
   - Display list of affected personal tasks to approver before confirmation

3. **Personal Level Rejection**:
   - Only reset the specific personal task to "In Progress" with reduced progress (-10%)

#### UI Requirements for Rejection:
- Show detailed list of tasks that will be affected by rejection
- Require confirmation with clear explanation of cascade effects
- Display task codes, names, and current status of affected tasks
- Allow approver to see which specific tasks are incomplete before making decision

### Approval Notifications & Alerts

#### Notification Triggers
- **Task Ready for Approval**: Notify approver when task reaches 100%
- **Approval Granted**: Notify task owner and team members
- **Approval Rejected**: Notify task owner with rejection reason
- **Overdue Approval**: Daily reminder to approvers for pending tasks

#### Notification Channels
- **In-app Notifications**: Real-time alerts in system
- **Email Notifications**: Summary emails for approvers
- **Dashboard Alerts**: Pending approval count on dashboard

### Business Rules for Approval

#### Auto-approval Conditions
- **Admin Role**: Can auto-approve without workflow
- **Emergency Tasks**: Marked urgent can bypass normal approval
- **Low-impact Tasks**: Tasks below certain threshold auto-approve

#### Approval Deadlines
- **Personal Tasks**: PM/PO must approve within 3 business days
- **Monthly Tasks**: CPO must approve within 5 business days
- **Escalation**: Auto-escalate to higher level if deadline missed

#### Approval Validation
- **Progress Verification**: System validates 100% progress before approval
- **Dependency Check**: Verify all prerequisite tasks completed
- **Quality Gates**: Check if DoD criteria met before approval

### 4.5.3 Selective Task Rejection Logic
When rejecting approval, the approver can identify specific child tasks that are considered incomplete despite showing 100% progress:

#### Business Rule:
- **Task Progress Calculation**: Parent task progress = average of all child tasks progress
- **Approval Trigger**: Task reaches 100% only when ALL child tasks reach 100%
- **Rejection Scenario**: Approver believes some 100% child tasks are not truly complete

#### Selective Rejection Process:
1. **Display All Child Tasks**: Show complete list of child tasks that contributed to 100% parent progress
2. **Allow Selection**: Approver can select specific child tasks they consider incomplete
3. **Reset Selected Tasks**:
   - Monthly tasks → Status: "Chờ phê duyệt" (Pending Approval), Progress: 50%
   - Personal tasks → Status: "Đang thực hiện" (In Progress), Progress: 50%
4. **Add Rejection Reason**: Require approver to provide reason for each rejected child task
5. **Cascade Update**: Parent task automatically recalculates progress based on updated child tasks
6. **Notification**: System notifies task assignees about rejection with specific reasons

#### UI Components for Selective Rejection:
- **Child Task List**: Checkbox list of all 100% child tasks
- **Reason Input**: Text field for rejection reason per selected task
- **Preview Impact**: Show calculated new progress for parent task after rejection
- **Confirm Action**: Final confirmation with summary of changes

### Additional Features
- File attachments support
- History tracking
- Task dependencies
- Time tracking (configurable: days/hours/%)
- Timesheet per person
- Sprint management (optional, configurable duration)
- Burn-down charts

### Reporting
- **Metrics:** Velocity, Completion rate, Lead time, Cycle time
- **Scope:** Team, individual, task-based
- **Frequency:** Weekly (configurable)

---

## 💰 Revenue Management Requirements

### Revenue Sources
- **Primary:** Cloud services revenue
- **Allocation:** By product per team
- **Type:** Monthly recurring revenue
- **Tracking:** No upsell/cross-sell tracking

### Revenue Processing
- **Recognition:** When revenue occurs
- **Allocation:** No time-based allocation
- **Integration:** Manual input (future: CRM integration)
- **Approval:** No approval workflow currently

### Targets & Planning
- **Set by:** BD team
- **Frequency:** Annual targets, monthly adjustments allowed
- **Scope:** Team-based targets
- **Forecasting:** Not implemented

### KPI Calculation
- **Formula:** (Actual Revenue / Target Revenue) × Quỹ điểm
- **Growth Rate:** Month-over-month comparison
- **Trend Analysis:** Quarterly trends
- **Reporting:** Real-time tracking

---

## 🎯 Quality of Service Requirements

### Quality Metrics
1. **Serious Incident Count:** Number of critical incidents
2. **On-time Request Processing Rate:** % of requests processed on time  
3. **On-time Successful Initialization Rate:** % of successful initializations on time

### KPI Calculations
1. **Serious Incident Rate:**
   - Penalty: >3 incidents/month → -20% quỹ điểm per additional incident
   - Formula: Quỹ điểm × [100% - 20% × (incidents - 3)]
   - Minimum: 0 points

2. **On-time Request Processing:**
   - Formula: (Actual Rate / Target Rate) × Quỹ điểm
   - Target: Configurable in system

3. **On-time Successful Initialization:**
   - Formula: (Actual Rate / Target Rate) × Quỹ điểm  
   - Target: Configurable in system

### Reporting
- Dashboard display
- Delta comparison with previous periods
- No incident management
- No customer feedback collection

---

## 📚 Training Management Requirements

### Training Types (Configurable)
- Đào tạo chuyên môn
- Chứng chỉ quốc tế

### Training Categories
- **Delivery:** Internal & External
- **Participation:** Mandatory & Voluntary
- **Roadmap:** No role-based training roadmap

### Course Information
| Field | Type | Description |
|-------|------|-------------|
| Title | Text | Course name |
| Mô tả | Text | Course description |
| Duration | Number | Course duration |
| Ngày bắt đầu | Date | Start date |
| Ngày kết thúc | Date | End date |
| DoD | Text | Definition of Done |
| Budget | Number | Training budget |

### Course Management
- **Creators:** Hành chính tổng hợp, Trưởng BU, SM, CPO
- **Classification:** By skill/domain
- **Scheduling:** No session scheduling

### Registration & Participation
- **Self-registration:** Users create/select courses and self-assign
- **Assignment:** Trưởng BU/SM/Hành chính tổng hợp assign participants
- **Approval:** Trưởng BU or CPO approve user-created training requests

### Progress Tracking
- **Completion:** Binary (completed/not completed)
- **Deadline:** Has completion deadline
- **Skills:** No skill matrix or level tracking

### KPI Calculation
- **International Certificates:** +1 point per certificate
- **Internal Training:** +1 point per training session
- **Budget Tracking:** Included
- **Scope:** Individual and team KPIs

---

## ⚖️ Compliance Management Requirements

### Compliance Types (Configurable)
1. **Tuân thủ nội quy** (Attendance Compliance)
2. **Tuân thủ quy trình** (Process Compliance)

### Attendance Compliance
- **Metric:** Number of late arrivals
- **Data Source:** Timesheet import
- **Rule:** Late if check-in > 8:59 AM OR no check-in without approval OR not on leave
- **Calculation:** Count late arrivals per individual → aggregate by team

### Process Compliance
- **Metric:** Process violation tracking
- **Data Source:** Manual violation reports
- **Process List:** Configurable list (add/edit/delete)
  - Agile Framework
  - QT Thiết kế và phát triển sản phẩm
  - QT phát triển phần mềm theo Agile
- **Violation Tracking:** Per team violations with details:
  - Title vi phạm
  - QT vi phạm (Process violated)
  - Mô tả (Description)

### KPI Calculation
- **Late Arrival Penalty:** -0.5 points per late arrival
- **Process Violation Penalty:** -1 point per process violation

### Reporting
- **Dashboard:** Display compliance information
- **Comparison:** Delta with previous months
- **Scope:** Individual and team statistics

---

## 📊 KPI Processing Requirements

### KPI Components & Scoring

#### 1. Task KPI
- **Completion Rate:** Average % progress of tasks per individual/team
- **Formula:** Completion Rate × Quỹ điểm
- **Additional Metrics:** Velocity, Lead time, Cycle time, On-time delivery
- **Personal Efficiency:** Completion rate × weight_a + On-time delivery × weight_b

#### 2. Revenue KPI  
- **Formula:** (Actual Revenue / Target Revenue) × Quỹ điểm
- **Growth Rate:** Month-over-month
- **Trend Analysis:** Quarterly
- **Allocation:** By team products

#### 3. Quality KPI
- **Serious Incidents:** Penalty system (>3 incidents = -20% per additional)
- **On-time Processing:** (Actual/Target) × Quỹ điểm  
- **On-time Initialization:** (Actual/Target) × Quỹ điểm
- **Targets:** Configurable per system setup

#### 4. Training KPI
- **International Certificates:** +1 point per certificate
- **Internal Training:** +1 point per session
- **Scope:** Individual and team

#### 5. Compliance KPI
- **Late Arrivals:** -0.5 points per occurrence
- **Process Violations:** -1 point per violation

### Team KPI Aggregation
```
Team KPI = Task KPI + Revenue KPI + Quality KPI (all 3 components) + Training KPI + Compliance KPI
```

### Personal KPI Formula
```
Personal KPI = Hiệu suất cá nhân × w1 + 
               Làm việc nhóm × w2 + 
               (10 - số lần đi muộn) × w3 + 
               Tập trung × w4 + 
               Dũng cảm × w5 + 
               Cởi mở × w6 + 
               Cam kết × w7 + 
               Tôn trọng × w8 + 
               Số chứng chỉ tháng
```

**Notes:**
- Manual rating input for criteria (Làm việc nhóm, Tập trung, etc.)
- Weights (w1-w8) configurable in system
- Formula NOT applied to Team 14

### Ranking & KI Distribution

#### Team Ranking
- **Method:** Descending order by Team KPI score
- **KI Allocation:** A+, A, B, C, D distributed by team rank
- **Configuration:** KI quantities set in system configuration

#### Individual Ranking  
- **Method:** Descending order by Personal KPI within team
- **KI Assignment:** 
  - Rank #1 in team → Highest KI allocated to team
  - Last rank in team → Lowest KI allocated to team

---

## 🖥️ Dashboard Requirements

### Real-time Features
- **Updates:** Real-time KPI updates
- **Historical Data:** 3-year retention
- **Comparisons:** Previous period + same period last year
- **Drill-down:** Team → Individual navigation

### Export Capabilities
- **Format:** PowerPoint reports
- **Content:** Comprehensive KPI reports

---

## ⚙️ Configuration Management

### Target Setting
- **Authority:** Trưởng BU / Hành chính tổng hợp
- **Flexibility:** Mid-period adjustments allowed
- **Scope:** All KPI targets and quotas

### Weight Configuration
- **Authority:** Trưởng BU / Hành chính tổng hợp  
- **Scope:** All formula weights and coefficients
- **Flexibility:** Runtime adjustments

### Formula Customization
- **Authority:** Trưởng BU / Hành chính tổng hợp
- **Scope:** All KPI calculation formulas
- **Flexibility:** Custom formula input

### Approval Workflow
- **Approver:** Trưởng BU
- **Scope:** All configuration changes
- **Process:** Required approval before activation

---

## 🎯 Success Criteria

### Performance Targets
- **Concurrent Users:** 500 users
- **Response Time:** <200ms API calls
- **Uptime:** 99.9% availability
- **Data Retention:** 3 years historical data

### Functional Requirements
- **Flexibility:** Configurable formulas, weights, targets
- **Accuracy:** Precise KPI calculations
- **Usability:** Intuitive dashboard interface
- **Scalability:** Support for organizational growth

---

## 🔧 Technical Requirements Summary

### System Architecture
- **Pattern:** Microservice architecture
- **Deployment:** Docker containers
- **Orchestration:** Docker Swarm/Kubernetes
- **Database:** MySQL 8.0 Master-Slave cluster
- **Caching:** Redis cluster
- **Message Queue:** RabbitMQ
- **Load Balancer:** Nginx

### 17 Microservices
**Core Services (6):**
- User Management (Port 3001)
- Task Management (Port 3002)
- Revenue Management (Port 3003)
- Quality of Service (Port 3004)
- Training Management (Port 3005)
- Compliance Management (Port 3006)

**KPI Processing (7):**
- KPI Task Calculator (Port 4001)
- KPI Revenue Calculator (Port 4002)
- KPI Quality Calculator (Port 4003)
- KPI Training Calculator (Port 4004)
- KPI Compliance Calculator (Port 4005)
- KPI Team Aggregator (Port 4006)
- KPI Personal Calculator (Port 4007)

**Dashboard & Analytics (4):**
- Dashboard Service (Port 6001)
- Analytics Engine (Port 6002)
- Chart Generator (Port 6003)
- Export Service (Port 6004)

### 8 Specialized Databases
- users_db
- tasks_db
- revenue_db
- qos_db
- training_db
- compliance_db
- kpi_analytics_db
- dashboard_config_db

### User Management API Specifications

#### Authentication Endpoints
- `POST /api/auth/login` - User login với JWT token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

#### User CRUD Endpoints
- `GET /api/users` - List users với pagination, search, filter
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin/Self)
- `DELETE /api/users/:id` - Soft delete user (Admin only)
- `DELETE /api/users/:id?permanent=true` - Hard delete user (Admin only)

#### Bulk Operations
- `POST /api/users/import` - Import users từ CSV file
- `GET /api/users/import/template` - Download CSV template
- `DELETE /api/users/bulk/all` - Soft delete all users (Admin only)
- `DELETE /api/users/bulk/all?permanent=true` - Hard delete all users (Admin only)

#### Reference Data
- `GET /api/roles` - List all available roles
- `GET /api/teams` - List all teams theo 4 layers

#### Security Features
- **JWT Authentication:** Bearer token với 24h expiry
- **Role-based Authorization:** Middleware check permissions
- **Input Validation:** Comprehensive validation cho tất cả inputs
- **Audit Logging:** Track all user operations
- **Rate Limiting:** 100 requests/minute per user

---

## 📝 Business Rules Summary

### Critical Business Logic
1. **Hierarchical Task Status:** Parent task status auto-calculated from children average
2. **Approval Workflow:** PM/PO → CPO approval chain
3. **KPI Scoring:** Each KPI has configurable quota points per team
4. **Penalty Systems:** Quality incidents and compliance violations have specific penalty formulas
5. **Ranking Algorithm:** Team ranking → Individual ranking → KI distribution
6. **Configuration Flexibility:** All formulas, weights, and targets are configurable

### Data Flow
```
Raw Data → Core Services → KPI Calculators → Team Aggregator → Personal Calculator → Dashboard → Reports
```

### Integration Points
- **Timesheet Import:** For attendance compliance
- **Manual Data Entry:** For process compliance and personal ratings
- **Future Integrations:** CRM system, HR system

---

## ⚠️ Important Notes

### Special Cases
- **Team 14 Exception:** Personal KPI formula does not apply to Team 14
- **Multi-team Membership:** Users can belong to multiple teams
- **Multi-role Assignment:** Users can have multiple roles
- **Configurable Everything:** Most business rules are configurable

### Data Validation Rules
- **Progress Percentage:** 0-100% only
- **Date Validation:** Actual dates must be logical vs planned dates
- **Approval Chain:** Strict hierarchy enforcement
- **KI Distribution:** Must match configured quotas

### Security Considerations
- **Role-based Access:** Strict permission enforcement
- **Team-based Data:** Users only see authorized team data
- **Configuration Changes:** Require approval workflow
- **Session Management:** 15-minute timeout

---

## 🔍 Approval Audit Trail & Reporting

### Audit Log Requirements
- **Approval Actions**: Who approved/rejected, when, and why
- **Status Changes**: Complete history of task status transitions
- **Progress Updates**: Track all progress modifications with timestamps
- **Permission Changes**: Log any role or permission modifications

### Audit Data Structure
| Field | Type | Description |
|-------|------|-------------|
| Action ID | UUID | Unique identifier for each action |
| Task ID | Reference | Link to affected task |
| User ID | Reference | Who performed the action |
| Action Type | Enum | Approve/Reject/Update/Create/Delete |
| Old Value | JSON | Previous state before action |
| New Value | JSON | New state after action |
| Reason | Text | Explanation for action (required for rejections) |
| Timestamp | DateTime | When action occurred |
| IP Address | String | Source IP for security tracking |

---

## 📊 Implementation Status

### User Management Module - ✅ COMPLETED
**Core Features:**
- ✅ User CRUD operations với full validation
- ✅ Role-based access control (14 roles)
- ✅ Team assignment (14 teams, 4 layers)
- ✅ JWT authentication với session management
- ✅ Multi-tier delete system (soft/hard delete)
- ✅ CSV import/export functionality
- ✅ Bulk operations với checkbox selection
- ✅ Responsive UI với mobile-friendly design
- ✅ Real-time search và filtering
- ✅ Audit logging cho tất cả operations

**API Endpoints:**
- ✅ Authentication: Login/logout/refresh/me
- ✅ User CRUD: GET/POST/PUT/DELETE với permissions
- ✅ Bulk operations: Import CSV, bulk delete
- ✅ Reference data: Roles và teams lookup
- ✅ Security: Rate limiting, input validation

**Database:**
- ✅ users_db với MySQL 8.0
- ✅ Normalized schema: users, roles, teams, user_roles, user_teams
- ✅ Audit trail support (user_history table)
- ✅ Soft delete implementation với is_active flag

**UI/UX:**
- ✅ Modern responsive design với dark theme
- ✅ Modal forms cho CRUD operations
- ✅ Advanced filtering và search
- ✅ Dropdown delete menu với confirmation levels
- ✅ Toast notifications và loading states
- ✅ Icon-only buttons trên mobile devices

### Approval Notifications & Alerts

#### Notification Triggers
- **Task Ready for Approval**: Notify approver when task reaches 100%
- **Approval Granted**: Notify task owner and team members
- **Approval Rejected**: Notify task owner with rejection reason
- **Overdue Approval**: Daily reminder to approvers for pending tasks

#### Business Rules for Approval
- **Personal Tasks**: PM/PO must approve within 3 business days
- **Monthly Tasks**: CPO must approve within 5 business days
- **Escalation**: Auto-escalate to higher level if deadline missed
- **Emergency Override**: Admin can bypass approval workflow for urgent tasks

### Integration with KPI Calculation
- **Approved Tasks**: Count towards team/individual KPI scores
- **Rejected Tasks**: Do not count until re-approved
- **Pending Tasks**: Excluded from current period KPI calculation
- **Real-time Updates**: KPIs recalculate immediately when approval status changes

---

*Document Version: 1.1*
*Last Updated: 2025-01-26*
*Status: Final for Development (Updated with Approval Workflow)*

**📋 Next Steps:**
1. Database Schema Design with Audit Tables
2. API Specification Creation with Approval Endpoints
3. Development Environment Setup
4. Core Infrastructure Implementation with Approval Workflow
