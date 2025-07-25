# 🎨 KPI TT Cloud - Frontend Design Requirements

## 📖 Tổng quan Design

**Design Style:** Minimalist, Business-oriented  
**Color Scheme:** #6e6e6e (Gray), #bcfd4c (Lime Green)  
**Framework:** Ant Design Components  
**Layout:** Cards với viền mảnh, đổ bóng nhẹ  
**Update Frequency:** Daily updates (không cần real-time)

---

## 🧭 Navigation Structure

### Sidebar Menu (Collapsible)
```
📊 Dashboard
📋 Quản lý Công việc
💰 Quản lý Doanh thu  
🎯 Chất lượng Dịch vụ
📚 Đào tạo
⚖️ Tuân thủ
📈 Báo cáo
⚙️ Quản trị (Admin Menu)
   ├── 👥 Quản lý User
   ├── 🔧 Cấu hình Hệ thống
   └── 🏗️ Cấu hình KPI
👤 Hồ sơ
```

### Navigation Features
- **Sidebar:** Có thể mở rộng/thu hẹp tùy ý
- **Breadcrumb:** Hiển thị đường dẫn navigation
- **Responsive:** Sidebar collapse trên mobile
- **Active State:** Highlight menu item hiện tại

---

## 🏠 Dashboard Layout

### Trang chủ Dashboard Components

#### 1. KPI Overview Cards
```
┌─────────────────┬─────────────────┐
│   KPI Công việc │   KPI Doanh thu │
│      85%        │      92%        │
│   [Progress]    │   [Progress]    │
└─────────────────┴─────────────────┘
```

#### 2. Performance Charts
```
┌─────────────────────────────────────┐
│     KPI Công việc theo thời gian    │
│     [Line Chart]                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     KPI Doanh thu theo thời gian    │
│     [Line Chart]                    │
└─────────────────────────────────────┘
```

#### 3. Rankings
```
┌─────────────────┬─────────────────┐
│  Team Rankings  │ Member Rankings │
│  1. Team A      │  1. Nguyễn A    │
│  2. Team B      │  2. Trần B      │
│  3. Team C      │  3. Lê C        │
└─────────────────┴─────────────────┘
```

---

## 📊 KPI Visualization

### Display Types (Linh động chọn)
1. **Number Cards** - Số liệu với icon và progress
2. **Progress Bars** - Thanh tiến độ với %
3. **Gauges/Meters** - Đồng hồ đo dạng tròn
4. **Mini Charts** - Sparklines trong cards

### Performance Color Coding
| Performance Level | Color | Range | Usage |
|------------------|-------|-------|-------|
| Good | 🟢 #bcfd4c | ≥90% | Excellent performance |
| Warning | 🟡 #ffa940 | 70-89% | Needs attention |
| Poor | 🔴 #ff4d4f | <70% | Critical action needed |
| Neutral | ⚪ #6e6e6e | N/A | No data/Inactive |

### Interactive Features
- **Drill-down:** Click vào KPI → Chi tiết theo team/cá nhân
- **Hover Effects:** Tooltip hiển thị thông tin chi tiết
- **Click Actions:** Navigate đến trang quản lý tương ứng

---

## 📈 Charts & Reports

### Chart Types
- **Line Charts:** Hiển thị trend theo thời gian
- **Bar Charts:** So sánh giữa teams/individuals
- **Pie Charts:** Phân bổ theo categories
- **Area Charts:** Cumulative data over time

### Time Period Filters
```
[Daily] [Weekly] [Monthly] [Quarterly]
```
- **Default:** Monthly view
- **Range Picker:** Custom date range selection
- **Quick Filters:** Last 7 days, Last 30 days, This quarter

### Export Options
#### Export Button Placement
```
┌─────────────────────────────────────┐
│ Chart Title              [Export ▼] │
│                                     │
│     [Chart Content]                 │
│                                     │
└─────────────────────────────────────┘
```

#### Export Formats
- **PDF** - Formatted reports
- **Excel** - Raw data với charts
- **PowerPoint** - Presentation slides
- **PNG** - Chart images

#### Export Features
- **Single Chart Export** - Export từng chart riêng lẻ
- **Bulk Export** - Chọn multiple charts
- **Scheduled Reports** - Tự động email hàng tuần/tháng
- **Custom Templates** - Pre-defined report layouts

---

## ⚡ Approval Workflow UI

### Option B - Workflow Timeline (Selected)
```
┌─────────────────────────────────────────────────────────┐
│ Task: Phát triển tính năng ABC                          │
│                                                         │
│ Created → [PM Review] → [CPO Approval] → Completed     │
│    ✅         ✅           🟡 Pending      ⏳ Waiting    │
│                                                         │
│ Current: Waiting for CPO Approval                      │
│ Assigned: Nguyễn Văn A (CPO)                          │
│ Due: 2025-01-28                                        │
└─────────────────────────────────────────────────────────┘
```

### Workflow States
- ✅ **Completed** - Green (#bcfd4c)
- 🟡 **Pending** - Yellow (#ffa940)  
- ⏳ **Waiting** - Gray (#6e6e6e)
- ❌ **Rejected** - Red (#ff4d4f)

### Approval Actions
- **Approve Button** - Green với icon ✅
- **Reject Button** - Red với icon ❌
- **Request Changes** - Yellow với icon 🔄
- **Add Comments** - Text area cho feedback

---

## 📱 Mobile Support

### Responsive Design
- **Desktop:** Full sidebar + main content
- **Tablet:** Collapsible sidebar overlay
- **Mobile:** Bottom navigation + hamburger menu

### Mobile Optimizations
- **Touch-friendly buttons** - Minimum 44px height
- **Swipe gestures** - Navigate between charts
- **Simplified charts** - Reduced complexity on small screens
- **Priority content** - Show most important KPIs first

---

## 🎯 User Experience Flow

### Primary User Journey
```
1. Login → Dashboard Overview
2. View KPI Cards → Identify issues
3. Drill-down → Detailed analysis
4. Take Action → Navigate to management pages
5. Track Progress → Return to dashboard
```

### Interaction Patterns
- **Progressive Disclosure** - Show summary → Details on demand
- **Contextual Actions** - Relevant buttons based on user role
- **Consistent Navigation** - Same patterns across all pages
- **Error Prevention** - Validation và confirmation dialogs

---

## 🔧 Technical Specifications

### Ant Design Components Usage
- **Layout:** Layout, Sider, Header, Content
- **Navigation:** Menu, Breadcrumb, Steps
- **Data Display:** Card, Table, Statistic, Progress
- **Charts:** Integration với Chart.js hoặc Recharts
- **Forms:** Form, Input, Select, DatePicker
- **Feedback:** Message, Notification, Modal

### Performance Requirements
- **Initial Load:** <3 seconds
- **Chart Rendering:** <1 second
- **Navigation:** <500ms transitions
- **Data Refresh:** <2 seconds

### Browser Support
- **Chrome:** Latest 2 versions
- **Firefox:** Latest 2 versions  
- **Safari:** Latest 2 versions
- **Edge:** Latest 2 versions

---

## 🎨 Visual Design Guidelines

### Typography
- **Headers:** Ant Design default font stack
- **Body:** 14px regular weight
- **Numbers:** 16px medium weight cho KPI values
- **Labels:** 12px regular weight

### Spacing
- **Card Padding:** 24px
- **Section Margins:** 16px
- **Component Gaps:** 8px
- **Page Margins:** 24px

### Shadows & Borders
- **Card Shadow:** `0 2px 8px rgba(0, 0, 0, 0.1)`
- **Border:** `1px solid #f0f0f0`
- **Border Radius:** 6px
- **Hover Shadow:** `0 4px 12px rgba(0, 0, 0, 0.15)`

---

## 📋 Implementation Checklist

### Phase 1: Core Layout
- [ ] Sidebar navigation với collapse
- [ ] Breadcrumb implementation
- [ ] Dashboard grid layout
- [ ] Basic card components

### Phase 2: KPI Components
- [ ] KPI display options (cards, progress, gauges)
- [ ] Color coding system
- [ ] Drill-down functionality
- [ ] Interactive tooltips

### Phase 3: Charts & Analytics
- [ ] Line charts với time filters
- [ ] Export functionality
- [ ] Responsive chart behavior
- [ ] Data loading states

### Phase 4: Workflow & Actions
- [ ] Approval workflow timeline
- [ ] Action buttons và forms
- [ ] User role-based permissions
- [ ] Error handling

---

*Document Version: 1.0*  
*Last Updated: 2025-01-26*  
*Status: Ready for Implementation*
