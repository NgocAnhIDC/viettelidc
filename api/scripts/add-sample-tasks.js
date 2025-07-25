const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'kpi123',
    database: 'users_db'
};

// Sample task data
const sampleTasks = [
    // === TASK LEVEL - Team 1 ===
    {
        code: 'T1_001',
        title: 'Triển khai VMware vSphere 8.0',
        monthly_work: '',
        personal_work: '',
        level: 'task',
        team_code: 'T1',
        type_code: 'nvtt',
        nature: 'Sản phẩm mới',
        product: 'VMware vSphere',
        objective: 'Nâng cấp hạ tầng ảo hóa lên phiên bản mới nhất',
        dod: 'Hệ thống vSphere 8.0 hoạt động ổn định, pass UAT',
        assignee: 'admin',
        progress: 75,
        status: 'in-progress',
        priority: 'high',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        actual_start_date: '2024-01-15',
        actual_end_date: null,
        created_by: 'admin'
    },
    {
        code: 'T1_001_M01',
        title: 'Chuẩn bị môi trường lab',
        monthly_work: 'Chuẩn bị môi trường lab cho vSphere 8.0',
        personal_work: '',
        level: 'monthly',
        parent_code: 'T1_001',
        team_code: 'T1',
        type_code: 'nvtt',
        assignee: 'admin',
        progress: 100,
        status: 'completed',
        priority: 'high',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        actual_start_date: '2024-01-15',
        actual_end_date: '2024-01-28',
        created_by: 'admin'
    },
    {
        code: 'T1_001_M01_P01',
        title: 'Cài đặt ESXi hosts',
        monthly_work: 'Chuẩn bị môi trường lab cho vSphere 8.0',
        personal_work: 'Cài đặt và cấu hình 3 ESXi hosts',
        level: 'personal',
        parent_code: 'T1_001_M01',
        team_code: 'T1',
        type_code: 'nvtt',
        assignee: 'admin',
        progress: 100,
        status: 'completed',
        priority: 'high',
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        actual_start_date: '2024-01-15',
        actual_end_date: '2024-01-20',
        created_by: 'admin'
    },
    // === TASK LEVEL - Team 2 ===
    {
        code: 'T2_001',
        title: 'Triển khai Backup Solution',
        monthly_work: '',
        personal_work: '',
        level: 'task',
        team_code: 'T2',
        type_code: 'nvkh',
        nature: 'Cải tiến',
        product: 'Veeam Backup',
        objective: 'Nâng cấp hệ thống backup cho cloud infrastructure',
        dod: 'Backup solution hoạt động ổn định với RPO < 4h',
        assignee: 'anhdn',
        progress: 45,
        status: 'in-progress',
        priority: 'medium',
        start_date: '2024-02-01',
        end_date: '2024-04-30',
        actual_start_date: '2024-02-05',
        actual_end_date: null,
        created_by: 'admin'
    },
    {
        code: 'T2_001_M01',
        title: 'Khảo sát và thiết kế',
        monthly_work: 'Khảo sát hiện trạng và thiết kế backup solution',
        personal_work: '',
        level: 'monthly',
        parent_code: 'T2_001',
        team_code: 'T2',
        type_code: 'nvkh',
        assignee: 'anhdn',
        progress: 80,
        status: 'in-progress',
        priority: 'medium',
        start_date: '2024-02-01',
        end_date: '2024-02-29',
        actual_start_date: '2024-02-05',
        actual_end_date: null,
        created_by: 'admin'
    },
    // === TASK LEVEL - Team 3 ===
    {
        code: 'T3_001',
        title: 'Nâng cấp Network Security',
        monthly_work: '',
        personal_work: '',
        level: 'task',
        team_code: 'T3',
        type_code: 'cthd',
        nature: 'Bảo mật',
        product: 'Fortinet FortiGate',
        objective: 'Nâng cấp hệ thống bảo mật mạng',
        dod: 'Firewall rules được cập nhật, security policies áp dụng',
        assignee: 'cpo',
        progress: 30,
        status: 'in-progress',
        priority: 'high',
        start_date: '2024-01-15',
        end_date: '2024-03-15',
        actual_start_date: '2024-01-20',
        actual_end_date: null,
        created_by: 'admin'
    },
    // === TASK LEVEL - Team 4 ===
    {
        code: 'T4_001',
        title: 'Phát triển OpenStack Dashboard',
        monthly_work: '',
        personal_work: '',
        level: 'task',
        team_code: 'T4',
        type_code: 'nvkh',
        nature: 'Phát triển mới',
        product: 'OpenStack Horizon',
        objective: 'Phát triển dashboard tùy chỉnh cho OpenStack',
        dod: 'Dashboard hoạt động với đầy đủ tính năng quản lý',
        assignee: 'pm1',
        progress: 60,
        status: 'in-progress',
        priority: 'medium',
        start_date: '2024-01-01',
        end_date: '2024-06-30',
        actual_start_date: '2024-01-10',
        actual_end_date: null,
        created_by: 'admin'
    },
    // === TASK LEVEL - Team 14 ===
    {
        code: 'T14_001',
        title: 'Triển khai KPI Management System',
        monthly_work: '',
        personal_work: '',
        level: 'task',
        team_code: 'T14',
        type_code: 'nvtt',
        nature: 'Hệ thống quản lý',
        product: 'KPI TT Cloud',
        objective: 'Triển khai hệ thống quản lý KPI cho toàn bộ teams',
        dod: 'Hệ thống hoạt động ổn định, tất cả teams sử dụng được',
        assignee: 'admin',
        progress: 85,
        status: 'pending-approval',
        priority: 'urgent',
        start_date: '2023-12-01',
        end_date: '2024-02-29',
        actual_start_date: '2023-12-15',
        actual_end_date: null,
        created_by: 'admin'
    },
    {
        code: 'T14_001_M01',
        title: 'Phát triển User Management',
        monthly_work: 'Phát triển module quản lý người dùng',
        personal_work: '',
        level: 'monthly',
        parent_code: 'T14_001',
        team_code: 'T14',
        type_code: 'nvtt',
        assignee: 'admin',
        progress: 100,
        status: 'approved',
        priority: 'urgent',
        start_date: '2023-12-01',
        end_date: '2023-12-31',
        actual_start_date: '2023-12-15',
        actual_end_date: '2023-12-28',
        created_by: 'admin'
    },
    {
        code: 'T14_001_M02',
        title: 'Phát triển Task Management',
        monthly_work: 'Phát triển module quản lý công việc',
        personal_work: '',
        level: 'monthly',
        parent_code: 'T14_001',
        team_code: 'T14',
        type_code: 'nvtt',
        assignee: 'admin',
        progress: 90,
        status: 'pending-approval',
        priority: 'urgent',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        actual_start_date: '2024-01-05',
        actual_end_date: null,
        created_by: 'admin'
    }
];

async function addSampleTasks() {
    let connection;
    
    try {
        console.log('🔗 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🗑️ Clearing existing sample tasks...');
        await connection.execute('DELETE FROM tasks WHERE created_by = ?', ['admin']);
        
        console.log('📝 Adding sample tasks...');
        
        for (const task of sampleTasks) {
            const insertQuery = `
                INSERT INTO tasks (
                    code, title, monthly_work, personal_work, level, parent_code,
                    team_code, type_code, nature, product, objective, dod,
                    assignee, progress, status, priority,
                    start_date, end_date, actual_start_date, actual_end_date,
                    created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const values = [
                task.code, task.title, task.monthly_work || '', task.personal_work || '',
                task.level, task.parent_code || null, task.team_code, task.type_code,
                task.nature || '', task.product || '', task.objective || '', task.dod || '',
                task.assignee, task.progress, task.status, task.priority,
                task.start_date, task.end_date, task.actual_start_date || null, task.actual_end_date || null,
                task.created_by
            ];
            
            await connection.execute(insertQuery, values);
            console.log(`✅ Added task: ${task.code} - ${task.title}`);
        }
        
        console.log(`🎉 Successfully added ${sampleTasks.length} sample tasks!`);
        
        // Show summary
        const [rows] = await connection.execute('SELECT level, COUNT(*) as count FROM tasks GROUP BY level');
        console.log('\n📊 Task Summary:');
        rows.forEach(row => {
            console.log(`- ${row.level}: ${row.count} tasks`);
        });
        
    } catch (error) {
        console.error('❌ Error adding sample tasks:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
addSampleTasks();
