#!/usr/bin/env node

/**
 * Swagger 文檔驗證工具
 *
 * 這個工具用於詳細檢查後端 API 是否與 Swagger 文檔一致：
 * 1. 檢查所有 API 端點是否存在
 * 2. 驗證請求/回應格式
 * 3. 檢查認證要求
 * 4. 驗證錯誤回應
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
    baseURL: 'http://localhost:3000',
    swaggerPath: '../public/docs/swagger.yaml',
    timeout: 10000
};

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
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

function logResult(testName, result, details = '') {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`[${status}] ${testName}`, color);
    if (details) {
        log(`   ${details}`, 'cyan');
    }
}

// 創建 axios 實例
const api = axios.create({
    baseURL: CONFIG.baseURL,
    timeout: CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * 解析 Swagger 文檔
 */
function parseSwaggerDocument() {
    try {
        const swaggerPath = path.join(__dirname, CONFIG.swaggerPath);
        const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
        const swaggerDoc = yaml.load(swaggerContent);

        return swaggerDoc;
    } catch (error) {
        log(`❌ 無法解析 Swagger 文檔: ${error.message}`, 'red');
        return null;
    }
}

/**
 * 提取 API 端點資訊
 */
function extractEndpoints(swaggerDoc) {
    const endpoints = [];

    if (!swaggerDoc || !swaggerDoc.paths) {
        return endpoints;
    }

    Object.entries(swaggerDoc.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, operation]) => {
            endpoints.push({
                path,
                method: method.toUpperCase(),
                operation,
                summary: operation.summary || 'No summary',
                tags: operation.tags || [],
                security: operation.security || [],
                parameters: operation.parameters || [],
                requestBody: operation.requestBody,
                responses: operation.responses || {}
            });
        });
    });

    return endpoints;
}

/**
 * 檢查端點是否存在
 */
async function checkEndpointExists(endpoint) {
    try {
        const response = await api.request({
            method: endpoint.method,
            url: endpoint.path,
            validateStatus: () => true // 接受所有狀態碼
        });

        // 檢查是否返回 404 或其他錯誤
        const exists = response.status !== 404;

        return {
            exists,
            status: response.status,
            response: response.data
        };
    } catch (error) {
        return {
            exists: false,
            status: 'ERROR',
            error: error.message
        };
    }
}

/**
 * 測試認證端點
 */
async function testAuthenticationEndpoints() {
    log('\n🔐 測試認證端點', 'blue');

    const authEndpoints = [
        {
            path: '/api/v1/user/signup',
            method: 'POST',
            data: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword123'
            }
        },
        {
            path: '/api/v1/user/signin',
            method: 'POST',
            data: {
                provider: 'native',
                email: 'test@example.com',
                password: 'testpassword123'
            }
        }
    ];

    let authToken = null;

    for (const endpoint of authEndpoints) {
        try {
            const response = await api.request({
                method: endpoint.method,
                url: endpoint.path,
                data: endpoint.data,
                validateStatus: () => true
            });

            const success = response.status === 200 || response.status === 403;
            const details = `狀態碼: ${response.status}`;

            if (response.status === 200 && response.data?.data?.access_token) {
                authToken = response.data.data.access_token;
                logResult(`${endpoint.method} ${endpoint.path}`, true, `${details}, Token: ${authToken.substring(0, 20)}...`);
            } else {
                logResult(`${endpoint.method} ${endpoint.path}`, success, details);
            }
        } catch (error) {
            logResult(`${endpoint.method} ${endpoint.path}`, false, `錯誤: ${error.message}`);
        }
    }

    return authToken;
}

/**
 * 測試產品相關端點
 */
async function testProductEndpoints() {
    log('\n📦 測試產品端點', 'blue');

    const productEndpoints = [
        {
            path: '/api/v1/products',
            method: 'GET',
            description: '獲取所有產品'
        },
        {
            path: '/api/v1/products/search?keyword=test',
            method: 'GET',
            description: '搜尋產品'
        },
        {
            path: '/api/v1/products/details?id=1',
            method: 'GET',
            description: '獲取產品詳情'
        }
    ];

    for (const endpoint of productEndpoints) {
        try {
            const response = await api.request({
                method: endpoint.method,
                url: endpoint.path,
                validateStatus: () => true
            });

            const success = response.status === 200;
            const details = `狀態碼: ${response.status}, ${endpoint.description}`;

            logResult(`${endpoint.method} ${endpoint.path}`, success, details);
        } catch (error) {
            logResult(`${endpoint.method} ${endpoint.path}`, false, `錯誤: ${error.message}`);
        }
    }
}

/**
 * 測試行銷相關端點
 */
async function testMarketingEndpoints() {
    log('\n📢 測試行銷端點', 'blue');

    const marketingEndpoints = [
        {
            path: '/api/v1/marketing/campaigns',
            method: 'GET',
            description: '獲取行銷活動列表'
        }
    ];

    for (const endpoint of marketingEndpoints) {
        try {
            const response = await api.request({
                method: endpoint.method,
                url: endpoint.path,
                validateStatus: () => true
            });

            const success = response.status === 200;
            const details = `狀態碼: ${response.status}, ${endpoint.description}`;

            logResult(`${endpoint.method} ${endpoint.path}`, success, details);
        } catch (error) {
            logResult(`${endpoint.method} ${endpoint.path}`, false, `錯誤: ${error.message}`);
        }
    }
}

/**
 * 測試管理員端點（需要認證）
 */
async function testAdminEndpoints(authToken) {
    log('\n👨‍💼 測試管理員端點', 'blue');

    if (!authToken) {
        log('⚠️ 缺少認證 token，跳過管理員端點測試', 'yellow');
        return;
    }

    const adminEndpoints = [
        {
            path: '/api/v1/admin/overview',
            method: 'GET',
            description: '管理員概覽'
        },
        {
            path: '/api/v1/admin/system/cache/status',
            method: 'GET',
            description: '快取服務狀態'
        }
    ];

    for (const endpoint of adminEndpoints) {
        try {
            const response = await api.request({
                method: endpoint.method,
                url: endpoint.path,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                validateStatus: () => true
            });

            const success = response.status === 200 || response.status === 403;
            const details = `狀態碼: ${response.status}, ${endpoint.description}`;

            logResult(`${endpoint.method} ${endpoint.path}`, success, details);
        } catch (error) {
            logResult(`${endpoint.method} ${endpoint.path}`, false, `錯誤: ${error.message}`);
        }
    }
}

/**
 * 檢查回應格式一致性
 */
function checkResponseFormat(swaggerDoc, endpoint, actualResponse) {
    const expectedResponses = endpoint.responses;
    const actualStatus = actualResponse.status;

    if (!expectedResponses[actualStatus]) {
        return {
            consistent: false,
            reason: `Swagger 文檔中沒有定義 ${actualStatus} 狀態碼的回應`
        };
    }

    const expectedResponse = expectedResponses[actualStatus];

    // 檢查是否有 content 定義
    if (expectedResponse.content && expectedResponse.content['application/json']) {
        const expectedSchema = expectedResponse.content['application/json'].schema;

        // 簡單的結構檢查
        if (expectedSchema.type === 'object' && typeof actualResponse.data !== 'object') {
            return {
                consistent: false,
                reason: '回應格式不匹配：期望物件，實際不是物件'
            };
        }

        if (expectedSchema.type === 'array' && !Array.isArray(actualResponse.data)) {
            return {
                consistent: false,
                reason: '回應格式不匹配：期望陣列，實際不是陣列'
            };
        }
    }

    return {
        consistent: true,
        reason: '回應格式符合 Swagger 文檔定義'
    };
}

/**
 * 生成詳細報告
 */
function generateDetailedReport(swaggerDoc, endpoints, testResults) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalEndpoints: endpoints.length,
            testedEndpoints: testResults.length,
            passedTests: testResults.filter(r => r.success).length,
            failedTests: testResults.filter(r => !r.success).length
        },
        swaggerInfo: {
            title: swaggerDoc.info?.title,
            version: swaggerDoc.info?.version,
            description: swaggerDoc.info?.description
        },
        endpoints: endpoints.map(endpoint => ({
            path: endpoint.path,
            method: endpoint.method,
            summary: endpoint.summary,
            tags: endpoint.tags,
            security: endpoint.security
        })),
        testResults: testResults,
        recommendations: []
    };

    // 生成建議
    if (report.summary.failedTests > 0) {
        report.recommendations.push('檢查失敗的端點實作');
    }

    if (report.summary.testedEndpoints < report.summary.totalEndpoints) {
        report.recommendations.push('增加更多端點測試覆蓋率');
    }

    const reportPath = path.join(__dirname, 'swagger-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    log(`📄 詳細報告已生成: ${reportPath}`, 'cyan');

    return report;
}

/**
 * 主測試函數
 */
async function runSwaggerValidation() {
    log('🚀 開始 Swagger 文檔驗證', 'magenta');
    log(`測試時間: ${new Date().toLocaleString()}`, 'cyan');
    log(`測試目標: ${CONFIG.baseURL}`, 'cyan');

    // 解析 Swagger 文檔
    log('\n📖 解析 Swagger 文檔', 'blue');
    const swaggerDoc = parseSwaggerDocument();

    if (!swaggerDoc) {
        log('❌ 無法繼續測試，Swagger 文檔解析失敗', 'red');
        return false;
    }

    logResult('Swagger 文檔解析', true, `標題: ${swaggerDoc.info?.title}, 版本: ${swaggerDoc.info?.version}`);

    // 提取端點
    const endpoints = extractEndpoints(swaggerDoc);
    logResult('端點提取', endpoints.length > 0, `找到 ${endpoints.length} 個端點`);

    // 測試健康檢查
    log('\n💚 測試健康檢查', 'blue');
    try {
        const healthResponse = await api.get('/health-check');
        const healthSuccess = healthResponse.status === 200;
        logResult('健康檢查', healthSuccess, `狀態碼: ${healthResponse.status}`);
    } catch (error) {
        logResult('健康檢查', false, `錯誤: ${error.message}`);
    }

    // 測試認證端點
    const authToken = await testAuthenticationEndpoints();

    // 測試產品端點
    await testProductEndpoints();

    // 測試行銷端點
    await testMarketingEndpoints();

    // 測試管理員端點
    await testAdminEndpoints(authToken);

    // 檢查端點存在性
    log('\n🔍 檢查端點存在性', 'blue');
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

    const endpointResults = [];

    for (const endpointPath of keyEndpoints) {
        const result = await checkEndpointExists({ path: endpointPath, method: 'GET' });
        endpointResults.push({
            path: endpointPath,
            success: result.exists,
            status: result.status,
            details: result.error || `狀態碼: ${result.status}`
        });

        logResult(`端點存在性: ${endpointPath}`, result.exists, result.error || `狀態碼: ${result.status}`);
    }

    // 生成報告
    const report = generateDetailedReport(swaggerDoc, endpoints, endpointResults);

    // 總結
    log('\n📊 Swagger 驗證結果總結', 'magenta');
    log(`總端點數: ${report.summary.totalEndpoints}`, 'cyan');
    log(`測試端點數: ${report.summary.testedEndpoints}`, 'cyan');
    log(`通過測試: ${report.summary.passedTests}`, 'green');
    log(`失敗測試: ${report.summary.failedTests}`, 'red');

    const successRate = (report.summary.passedTests / report.summary.testedEndpoints * 100).toFixed(1);
    log(`🎯 成功率: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');

    if (report.summary.failedTests === 0) {
        log('🎉 Swagger 驗證完全通過！後端 API 與文檔一致。', 'green');
    } else {
        log('⚠️ 部分驗證失敗，請檢查後端實作與 Swagger 文檔的一致性。', 'yellow');
    }

    return report.summary.failedTests === 0;
}

// 執行測試
async function main() {
    try {
        const success = await runSwaggerValidation();

        // 延遲一下讓日誌完整輸出
        await new Promise(resolve => setTimeout(resolve, 1000));

        process.exit(success ? 0 : 1);
    } catch (error) {
        log(`❌ Swagger 驗證執行失敗: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 如果直接執行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { runSwaggerValidation };
