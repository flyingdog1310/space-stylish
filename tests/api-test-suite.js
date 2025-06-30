#!/usr/bin/env node

/**
 * API 測試套件
 *
 * 這個測試套件用於驗證後端 API 是否與 Swagger 文檔一致：
 * 1. 檢查 API 端點是否存在
 * 2. 驗證請求/回應格式
 * 3. 測試認證機制
 * 4. 驗證錯誤處理
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 測試配置
const TEST_CONFIG = {
    baseURL: 'http://localhost:3000',
    apiVersion: 'v1',
    timeout: 10000,
    testUser: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
    }
};

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, result, details = '') {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`[${status}] ${testName}`, color);
    if (details) {
        log(`   ${details}`, 'cyan');
    }
}

// 創建 axios 實例
const api = axios.create({
    baseURL: TEST_CONFIG.baseURL,
    timeout: TEST_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 測試結果追蹤
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

// 認證 token
let authToken = null;

/**
 * 測試健康檢查端點
 */
async function testHealthCheck() {
    log('\n🔍 測試健康檢查端點', 'blue');

    try {
        const response = await api.get('/health-check');

        const success = response.status === 200 &&
                       (response.data === 'ok' ||
                        (response.data && response.data.success === true));

        logTest('健康檢查', success, `狀態碼: ${response.status}, 回應: ${JSON.stringify(response.data)}`);

        return success;
    } catch (error) {
        logTest('健康檢查', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試用戶註冊
 */
async function testUserSignup() {
    log('\n🔍 測試用戶註冊', 'blue');

    try {
        const signupData = {
            name: TEST_CONFIG.testUser.name,
            email: TEST_CONFIG.testUser.email,
            password: TEST_CONFIG.testUser.password
        };

        const response = await api.post(`/api/${TEST_CONFIG.apiVersion}/user/signup`, signupData);

        const success = response.status === 200 &&
                       response.data &&
                       response.data.data &&
                       response.data.data.access_token;

        if (success) {
            authToken = response.data.data.access_token;
            logTest('用戶註冊', true, `Token: ${authToken.substring(0, 20)}...`);
        } else {
            logTest('用戶註冊', false, `回應格式不正確: ${JSON.stringify(response.data)}`);
        }

        return success;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            logTest('用戶註冊', true, '用戶已存在（預期行為）');
            return true;
        }
        logTest('用戶註冊', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試用戶登入
 */
async function testUserSignin() {
    log('\n🔍 測試用戶登入', 'blue');

    try {
        const signinData = {
            provider: 'native',
            email: TEST_CONFIG.testUser.email,
            password: TEST_CONFIG.testUser.password
        };

        const response = await api.post(`/api/${TEST_CONFIG.apiVersion}/user/signin`, signinData);

        const success = response.status === 200 &&
                       response.data &&
                       response.data.data &&
                       response.data.data.access_token;

        if (success) {
            authToken = response.data.data.access_token;
            logTest('用戶登入', true, `Token: ${authToken.substring(0, 20)}...`);
        } else {
            logTest('用戶登入', false, `回應格式不正確: ${JSON.stringify(response.data)}`);
        }

        return success;
    } catch (error) {
        logTest('用戶登入', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試產品列表 API
 */
async function testProductList() {
    log('\n🔍 測試產品列表 API', 'blue');

    try {
        const response = await api.get(`/api/${TEST_CONFIG.apiVersion}/products`);

        const success = response.status === 200 &&
                       response.data &&
                       Array.isArray(response.data.data);

        logTest('產品列表', success, `狀態碼: ${response.status}, 產品數量: ${response.data?.data?.length || 0}`);

        return success;
    } catch (error) {
        logTest('產品列表', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試產品搜尋 API
 */
async function testProductSearch() {
    log('\n🔍 測試產品搜尋 API', 'blue');

    try {
        const response = await api.get(`/api/${TEST_CONFIG.apiVersion}/products/search?keyword=test`);

        const success = response.status === 200 &&
                       response.data &&
                       Array.isArray(response.data.data);

        logTest('產品搜尋', success, `狀態碼: ${response.status}, 搜尋結果數量: ${response.data?.data?.length || 0}`);

        return success;
    } catch (error) {
        logTest('產品搜尋', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試產品詳情 API
 */
async function testProductDetail() {
    log('\n🔍 測試產品詳情 API', 'blue');

    try {
        const response = await api.get(`/api/${TEST_CONFIG.apiVersion}/products/details?id=1`);

        const success = response.status === 200 &&
                       response.data &&
                       response.data.data;

        logTest('產品詳情', success, `狀態碼: ${response.status}, 產品ID: ${response.data?.data?.id || 'N/A'}`);

        return success;
    } catch (error) {
        logTest('產品詳情', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試用戶資料 API（需要認證）
 */
async function testUserProfile() {
    log('\n🔍 測試用戶資料 API', 'blue');

    if (!authToken) {
        logTest('用戶資料', false, '缺少認證 token');
        return false;
    }

    try {
        const response = await api.get(`/api/${TEST_CONFIG.apiVersion}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const success = response.status === 200 &&
                       response.data &&
                       response.data.data;

        logTest('用戶資料', success, `狀態碼: ${response.status}, 用戶ID: ${response.data?.data?.id || 'N/A'}`);

        return success;
    } catch (error) {
        logTest('用戶資料', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試行銷活動 API
 */
async function testMarketingCampaigns() {
    log('\n🔍 測試行銷活動 API', 'blue');

    try {
        const response = await api.get(`/api/${TEST_CONFIG.apiVersion}/marketing/campaigns`);

        const success = response.status === 200 &&
                       response.data &&
                       Array.isArray(response.data.data);

        logTest('行銷活動', success, `狀態碼: ${response.status}, 活動數量: ${response.data?.data?.length || 0}`);

        return success;
    } catch (error) {
        logTest('行銷活動', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試管理員 API（需要認證）
 */
async function testAdminAPI() {
    log('\n🔍 測試管理員 API', 'blue');

    if (!authToken) {
        logTest('管理員 API', false, '缺少認證 token');
        return false;
    }

    try {
        const response = await api.get('/api/v1/admin/overview', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const success = response.status === 200 &&
                       response.data &&
                       response.data.data;

        logTest('管理員概覽', success, `狀態碼: ${response.status}`);

        return success;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            logTest('管理員 API', true, '權限不足（預期行為）');
            return true;
        }
        logTest('管理員 API', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試快取服務狀態 API
 */
async function testCacheStatusAPI() {
    log('\n🔍 測試快取服務狀態 API', 'blue');

    if (!authToken) {
        logTest('快取狀態 API', false, '缺少認證 token');
        return false;
    }

    try {
        const response = await api.get('/api/v1/admin/system/cache/status', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const success = response.status === 200 &&
                       response.data &&
                       response.data.data &&
                       response.data.data.status;

        logTest('快取狀態', success, `狀態碼: ${response.status}, 連接狀態: ${response.data?.data?.status?.isConnected || 'N/A'}`);

        return success;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            logTest('快取狀態 API', true, '權限不足（預期行為）');
            return true;
        }
        logTest('快取狀態 API', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 測試錯誤處理
 */
async function testErrorHandling() {
    log('\n🔍 測試錯誤處理', 'blue');

    try {
        // 測試不存在的端點
        const response = await api.get('/api/nonexistent');

        const success = response.status === 404;

        logTest('404 錯誤處理', success, `狀態碼: ${response.status}`);

        return success;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            logTest('404 錯誤處理', true, '正確返回 404');
            return true;
        }
        logTest('404 錯誤處理', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 檢查 API 端點與 Swagger 文檔一致性
 */
async function checkSwaggerConsistency() {
    log('\n🔍 檢查 API 端點與 Swagger 文檔一致性', 'blue');

    try {
        // 讀取 Swagger 文檔
        const swaggerPath = path.join(__dirname, '../public/docs/swagger.yaml');
        const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');

        // 解析路徑（簡化版本）
        const paths = [];
        const pathMatches = swaggerContent.match(/^\s*(\/[^:]+):/gm);

        if (pathMatches) {
            pathMatches.forEach(match => {
                const path = match.trim().replace(':', '');
                paths.push(path);
            });
        }

        logTest('Swagger 文檔解析', paths.length > 0, `找到 ${paths.length} 個端點`);

        // 檢查關鍵端點是否存在
        const keyEndpoints = [
            '/health-check',
            '/api/v1/user/signup',
            '/api/v1/user/signin',
            '/api/v1/products',
            '/api/v1/products/search',
            '/api/v1/products/details',
            '/api/v1/marketing/campaigns',
            '/api/v1/admin/overview'
        ];

        const missingEndpoints = keyEndpoints.filter(endpoint => !paths.includes(endpoint));

        if (missingEndpoints.length === 0) {
            logTest('端點一致性', true, '所有關鍵端點都存在於 Swagger 文檔中');
        } else {
            logTest('端點一致性', false, `缺少端點: ${missingEndpoints.join(', ')}`);
        }

        return missingEndpoints.length === 0;
    } catch (error) {
        logTest('Swagger 一致性檢查', false, `錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 執行所有測試
 */
async function runAllTests() {
    log('🚀 開始 API 測試套件', 'magenta');
    log(`測試時間: ${new Date().toLocaleString()}`, 'cyan');
    log(`測試目標: ${TEST_CONFIG.baseURL}`, 'cyan');

    const tests = [
        { name: '健康檢查', fn: testHealthCheck },
        { name: '用戶註冊', fn: testUserSignup },
        { name: '用戶登入', fn: testUserSignin },
        { name: '產品列表', fn: testProductList },
        { name: '產品搜尋', fn: testProductSearch },
        { name: '產品詳情', fn: testProductDetail },
        { name: '用戶資料', fn: testUserProfile },
        { name: '行銷活動', fn: testMarketingCampaigns },
        { name: '管理員 API', fn: testAdminAPI },
        { name: '快取狀態 API', fn: testCacheStatusAPI },
        { name: '錯誤處理', fn: testErrorHandling },
        { name: 'Swagger 一致性', fn: checkSwaggerConsistency }
    ];

    for (const test of tests) {
        try {
            const result = await test.fn();
            testResults.total++;
            if (result) {
                testResults.passed++;
            } else {
                testResults.failed++;
            }
            testResults.details.push({ name: test.name, success: result });
        } catch (error) {
            testResults.total++;
            testResults.failed++;
            testResults.details.push({ name: test.name, success: false, error: error.message });
            logTest(test.name, false, `測試執行錯誤: ${error.message}`);
        }
    }

    // 測試結果總結
    log('\n📊 API 測試結果總結', 'magenta');
    log(`總測試數: ${testResults.total}`, 'cyan');
    log(`通過: ${testResults.passed}`, 'green');
    log(`失敗: ${testResults.failed}`, 'red');

    testResults.details.forEach(result => {
        const status = result.success ? '✅' : '❌';
        log(`${status} ${result.name}`, result.success ? 'green' : 'red');
    });

    const successRate = (testResults.passed / testResults.total * 100).toFixed(1);
    log(`\n🎯 成功率: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');

    if (testResults.passed === testResults.total) {
        log('🎉 所有 API 測試通過！後端與 Swagger 文檔一致。', 'green');
    } else {
        log('⚠️ 部分 API 測試失敗，請檢查後端實作。', 'yellow');
    }

    return testResults.passed === testResults.total;
}

/**
 * 生成測試報告
 */
function generateTestReport() {
    const report = {
        timestamp: new Date().toISOString(),
        config: TEST_CONFIG,
        results: testResults,
        summary: {
            total: testResults.total,
            passed: testResults.passed,
            failed: testResults.failed,
            successRate: (testResults.passed / testResults.total * 100).toFixed(1)
        }
    };

    const reportPath = path.join(__dirname, 'api-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    log(`📄 測試報告已生成: ${reportPath}`, 'cyan');
}

// 執行測試
async function main() {
    try {
        const success = await runAllTests();
        generateTestReport();

        // 延遲一下讓日誌完整輸出
        await new Promise(resolve => setTimeout(resolve, 1000));

        process.exit(success ? 0 : 1);
    } catch (error) {
        log(`❌ 測試執行失敗: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 如果直接執行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { runAllTests, generateTestReport };
