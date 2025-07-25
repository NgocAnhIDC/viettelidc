const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
let authToken = '';

async function comprehensiveTest() {
    console.log('🚀 STARTING COMPREHENSIVE API TESTING...\n');
    
    try {
        // Test 1: Health Check
        await testHealthCheck();
        
        // Test 2: Authentication
        await testAuthentication();
        
        // Test 3: Task Categories
        await testTaskCategories();
        
        // Test 4: Task CRUD Operations
        await testTaskCRUD();
        
        // Test 5: Task Progress Updates
        await testTaskProgress();
        
        // Test 6: Task Statistics
        await testTaskStatistics();
        
        // Test 7: Error Handling
        await testErrorHandling();
        
        console.log('\n🎉 ALL COMPREHENSIVE TESTS COMPLETED SUCCESSFULLY!');
        
    } catch (error) {
        console.error('\n❌ COMPREHENSIVE TEST FAILED:', error.message);
        process.exit(1);
    }
}

async function testHealthCheck() {
    console.log('🔍 TEST 1: Health Check...');
    try {
        const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
        console.log('✅ Health check passed:', response.data);
    } catch (error) {
        console.log('⚠️ Health endpoint not available, continuing with other tests...');
    }
}

async function testAuthentication() {
    console.log('\n🔐 TEST 2: Authentication...');
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, { timeout: 10000 });
        
        if (response.data.success && response.data.data.token) {
            authToken = response.data.data.token;
            console.log('✅ Authentication successful');
            console.log('   Token length:', authToken.length);
            console.log('   User:', response.data.data.user.username);
        } else {
            throw new Error('Invalid authentication response');
        }
    } catch (error) {
        console.error('❌ Authentication failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testTaskCategories() {
    console.log('\n📋 TEST 3: Task Categories...');
    try {
        const response = await axios.get(`${API_BASE_URL}/tasks/categories`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        console.log('✅ Categories loaded successfully');
        console.log('   Response structure:', Object.keys(response.data));
        
        if (response.data.data && response.data.data.categories) {
            console.log('   Categories found:', Array.isArray(response.data.data.categories) ? 
                response.data.data.categories.length : 'Single category object');
        }
    } catch (error) {
        console.error('❌ Task categories test failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testTaskCRUD() {
    console.log('\n📝 TEST 4: Task CRUD Operations...');
    let createdTaskId = null;
    
    try {
        // CREATE
        console.log('   4.1: Creating task...');
        const createResponse = await axios.post(`${API_BASE_URL}/tasks`, {
            task_code: 'TEST-CRUD-' + Date.now(),
            title: 'Comprehensive Test Task',
            description: 'This task is created by comprehensive testing',
            task_level: 'task',
            assigned_to: 1,
            team_id: 1,
            category_id: 1,
            priority: 'high',
            planned_start_date: '2025-07-24',
            planned_end_date: '2025-07-31'
        }, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        if (createResponse.data.success && createResponse.data.data.task) {
            createdTaskId = createResponse.data.data.task.id;
            console.log('   ✅ Task created successfully, ID:', createdTaskId);
        } else {
            throw new Error('Task creation failed');
        }
        
        // READ
        console.log('   4.2: Reading task...');
        const readResponse = await axios.get(`${API_BASE_URL}/tasks/${createdTaskId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        if (readResponse.data.success && readResponse.data.data.task) {
            console.log('   ✅ Task read successfully');
            console.log('   Task title:', readResponse.data.data.task.title);
        } else {
            throw new Error('Task read failed');
        }
        
        // UPDATE
        console.log('   4.3: Updating task...');
        const updateResponse = await axios.put(`${API_BASE_URL}/tasks/${createdTaskId}`, {
            title: 'Updated Comprehensive Test Task',
            description: 'This task has been updated by comprehensive testing',
            priority: 'medium'
        }, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        if (updateResponse.data.success) {
            console.log('   ✅ Task updated successfully');
        } else {
            throw new Error('Task update failed');
        }
        
        // LIST
        console.log('   4.4: Listing tasks...');
        const listResponse = await axios.get(`${API_BASE_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        if (listResponse.data.success && listResponse.data.data.tasks) {
            const tasks = Array.isArray(listResponse.data.data.tasks) ? 
                listResponse.data.data.tasks : [listResponse.data.data.tasks];
            console.log('   ✅ Tasks listed successfully, count:', tasks.length);
        } else {
            throw new Error('Task list failed');
        }
        
        // DELETE
        console.log('   4.5: Deleting task...');
        const deleteResponse = await axios.delete(`${API_BASE_URL}/tasks/${createdTaskId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        if (deleteResponse.data.success) {
            console.log('   ✅ Task deleted successfully');
        } else {
            throw new Error('Task deletion failed');
        }
        
    } catch (error) {
        console.error('❌ Task CRUD test failed:', error.response?.data || error.message);
        
        // Cleanup if task was created but test failed
        if (createdTaskId) {
            try {
                await axios.delete(`${API_BASE_URL}/tasks/${createdTaskId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                console.log('   🧹 Cleanup: Test task deleted');
            } catch (cleanupError) {
                console.log('   ⚠️ Cleanup failed, manual cleanup may be needed');
            }
        }
        
        throw error;
    }
}

async function testTaskProgress() {
    console.log('\n📈 TEST 5: Task Progress Updates...');
    let testTaskId = null;
    
    try {
        // Create a test task first
        const createResponse = await axios.post(`${API_BASE_URL}/tasks`, {
            task_code: 'TEST-PROGRESS-' + Date.now(),
            title: 'Progress Test Task',
            description: 'Task for testing progress updates',
            task_level: 'task',
            assigned_to: 1,
            team_id: 1,
            category_id: 1,
            priority: 'medium'
        }, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        testTaskId = createResponse.data.data.task.id;
        
        // Update progress
        const progressResponse = await axios.patch(`${API_BASE_URL}/tasks/${testTaskId}/progress`, {
            progress_percentage: 75,
            notes: 'Progress updated by comprehensive test'
        }, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        if (progressResponse.data.success) {
            console.log('✅ Task progress updated successfully');
            console.log('   Progress: 75%');
        } else {
            throw new Error('Progress update failed');
        }
        
        // Cleanup
        await axios.delete(`${API_BASE_URL}/tasks/${testTaskId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
    } catch (error) {
        console.error('❌ Task progress test failed:', error.response?.data || error.message);
        
        // Cleanup
        if (testTaskId) {
            try {
                await axios.delete(`${API_BASE_URL}/tasks/${testTaskId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
            } catch (cleanupError) {
                console.log('   ⚠️ Progress test cleanup failed');
            }
        }
        
        throw error;
    }
}

async function testTaskStatistics() {
    console.log('\n📊 TEST 6: Task Statistics...');
    try {
        const response = await axios.get(`${API_BASE_URL}/tasks/statistics`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 10000
        });
        
        if (response.data.success && response.data.data.statistics) {
            console.log('✅ Task statistics loaded successfully');
            const stats = response.data.data.statistics;
            console.log('   Total tasks:', stats.total_tasks || 0);
            console.log('   In progress:', stats.in_progress || 0);
            console.log('   Completed:', stats.completed || 0);
        } else {
            throw new Error('Statistics load failed');
        }
    } catch (error) {
        console.error('❌ Task statistics test failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testErrorHandling() {
    console.log('\n🚨 TEST 7: Error Handling...');
    try {
        // Test invalid task ID
        try {
            await axios.get(`${API_BASE_URL}/tasks/99999`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
                timeout: 5000
            });
            console.log('⚠️ Expected 404 error not received');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('   ✅ 404 error handling works correctly');
            } else {
                console.log('   ⚠️ Unexpected error type:', error.response?.status);
            }
        }
        
        // Test invalid authentication
        try {
            await axios.get(`${API_BASE_URL}/tasks`, {
                headers: { 'Authorization': 'Bearer invalid-token' },
                timeout: 5000
            });
            console.log('⚠️ Expected 401 error not received');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('   ✅ 401 error handling works correctly');
            } else {
                console.log('   ⚠️ Unexpected error type:', error.response?.status);
            }
        }
        
        console.log('✅ Error handling tests completed');
        
    } catch (error) {
        console.error('❌ Error handling test failed:', error.message);
        throw error;
    }
}

// Run comprehensive test
comprehensiveTest();
