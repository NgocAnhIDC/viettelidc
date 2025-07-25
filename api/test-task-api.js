/**
 * Task Management API Test Script
 * Tests the Task Management API endpoints
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const TASK_API_URL = `${API_BASE_URL}/tasks`;

// Test credentials
const TEST_ADMIN = {
    username: 'admin',
    password: 'admin123'
};

let authToken = '';

/**
 * Login and get auth token
 */
async function login() {
    try {
        console.log('🔐 Logging in as admin...');
        const response = await axios.post(`${API_BASE_URL}/auth/login`, TEST_ADMIN);
        
        if (response.data.success && response.data.data.token) {
            authToken = response.data.data.token;
            console.log('✅ Login successful');
            return true;
        } else {
            console.error('❌ Login failed:', response.data);
            return false;
        }
    } catch (error) {
        console.error('❌ Login error:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Get auth headers
 */
function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Test task categories endpoint
 */
async function testGetTaskCategories() {
    try {
        console.log('\n📋 Testing get task categories...');
        const response = await axios.get(`${TASK_API_URL}/categories`, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            console.log('✅ Task categories retrieved successfully');
            console.log(`   Found ${response.data.data.categories.length} categories`);
            return response.data.data.categories;
        } else {
            console.error('❌ Failed to get task categories:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Get task categories error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Test create task endpoint
 */
async function testCreateTask() {
    try {
        console.log('\n📝 Testing create task...');
        
        const taskData = {
            task_code: 'TEST-TASK-001',
            title: 'Test Task for API Validation',
            description: 'This is a test task created by the API test script',
            task_level: 'task',
            assigned_to: 1, // Admin user
            team_id: 1, // Team 1
            category_id: 1, // Development category
            priority: 'medium',
            planned_start_date: '2025-07-24',
            planned_end_date: '2025-07-31',
            notes: 'Test task notes'
        };

        const response = await axios.post(TASK_API_URL, taskData, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            console.log('✅ Task created successfully');
            console.log(`   Task ID: ${response.data.data.task.id}`);
            console.log(`   Task Code: ${response.data.data.task.task_code}`);
            return response.data.data.task;
        } else {
            console.error('❌ Failed to create task:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Create task error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Test get all tasks endpoint
 */
async function testGetAllTasks() {
    try {
        console.log('\n📊 Testing get all tasks...');
        const response = await axios.get(TASK_API_URL, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            console.log('✅ Tasks retrieved successfully');
            console.log(`   Found ${response.data.data.tasks.length} tasks`);
            return response.data.data.tasks;
        } else {
            console.error('❌ Failed to get tasks:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Get tasks error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Test get task by ID endpoint
 */
async function testGetTaskById(taskId) {
    try {
        console.log(`\n🔍 Testing get task by ID (${taskId})...`);
        const response = await axios.get(`${TASK_API_URL}/${taskId}`, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            console.log('✅ Task retrieved successfully');
            console.log(`   Task: ${response.data.data.task.task_code} - ${response.data.data.task.title}`);
            return response.data.data.task;
        } else {
            console.error('❌ Failed to get task:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Get task by ID error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Test update task progress endpoint
 */
async function testUpdateTaskProgress(taskId) {
    try {
        console.log(`\n📈 Testing update task progress (${taskId})...`);
        
        const progressData = {
            progress_percentage: 50,
            notes: 'Task is 50% complete - API test update'
        };

        const response = await axios.patch(`${TASK_API_URL}/${taskId}/progress`, progressData, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            console.log('✅ Task progress updated successfully');
            console.log(`   Progress: ${response.data.data.task.progress_percentage}%`);
            return response.data.data.task;
        } else {
            console.error('❌ Failed to update task progress:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Update task progress error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Test task statistics endpoint
 */
async function testGetTaskStatistics() {
    try {
        console.log('\n📊 Testing get task statistics...');
        const response = await axios.get(`${TASK_API_URL}/statistics`, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            console.log('✅ Task statistics retrieved successfully');
            const stats = response.data.data.statistics;
            console.log(`   Total tasks: ${stats.total_tasks}`);
            console.log(`   In progress: ${stats.in_progress}`);
            console.log(`   Completed: ${stats.completed}`);
            console.log(`   Average progress: ${Math.round(stats.avg_progress)}%`);
            return stats;
        } else {
            console.error('❌ Failed to get task statistics:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Get task statistics error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Test my tasks endpoint
 */
async function testGetMyTasks() {
    try {
        console.log('\n👤 Testing get my tasks...');
        const response = await axios.get(`${TASK_API_URL}/my-tasks`, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            console.log('✅ My tasks retrieved successfully');
            console.log(`   Found ${response.data.data.tasks.length} tasks assigned to me`);
            return response.data.data.tasks;
        } else {
            console.error('❌ Failed to get my tasks:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Get my tasks error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Clean up test data
 */
async function cleanupTestData(taskId) {
    try {
        console.log(`\n🧹 Cleaning up test task (${taskId})...`);
        const response = await axios.delete(`${TASK_API_URL}/${taskId}`, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            console.log('✅ Test task deleted successfully');
            return true;
        } else {
            console.error('❌ Failed to delete test task:', response.data);
            return false;
        }
    } catch (error) {
        console.error('❌ Delete test task error:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🚀 Starting Task Management API Tests...\n');

    // Login first
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.error('❌ Cannot proceed without authentication');
        return;
    }

    let testTaskId = null;

    try {
        // Test 1: Get task categories
        await testGetTaskCategories();

        // Test 2: Create task
        const createdTask = await testCreateTask();
        if (createdTask) {
            testTaskId = createdTask.id;
        }

        // Test 3: Get all tasks
        await testGetAllTasks();

        // Test 4: Get task by ID
        if (testTaskId) {
            await testGetTaskById(testTaskId);
        }

        // Test 5: Update task progress
        if (testTaskId) {
            await testUpdateTaskProgress(testTaskId);
        }

        // Test 6: Get task statistics
        await testGetTaskStatistics();

        // Test 7: Get my tasks
        await testGetMyTasks();

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        console.error('\n❌ Test suite error:', error.message);
    } finally {
        // Cleanup
        if (testTaskId) {
            await cleanupTestData(testTaskId);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    runAllTests,
    login,
    testGetTaskCategories,
    testCreateTask,
    testGetAllTasks,
    testGetTaskById,
    testUpdateTaskProgress,
    testGetTaskStatistics,
    testGetMyTasks
};
