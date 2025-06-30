#!/usr/bin/env node

/**
 * 測試執行器
 *
 * 這個腳本用於運行所有測試套件：
 * 1. API 測試套件
 * 2. Swagger 驗證測試
 * 3. 快取故障容錯測試
 */

import { runAllTests } from './api-test-suite.js';
import { runSwaggerValidation } from './swagger-validator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function logSection(title) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`  ${title}`, 'magenta');
    log(`${'='.repeat(60)}`, 'cyan');
}

// 測試結果追蹤
const testResults = {
    timestamp: new Date().toISOString(),
    suites: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0
    }
};

/**
 * 運行快取故障容錯測試
 */
async function runCacheFaultToleranceTest() {
    logSection('快取故障容錯測試');

    try {
        // 檢查測試檔案是否存在
        const testPath = path.join(__dirname, 'test-cache-fault-tolerance.js');

        if (!fs.existsSync(testPath)) {
            log('⚠️ 快取故障容錯測試檔案不存在，跳過此測試', 'yellow');
            return { success: true, skipped: true };
        }

        // 動態導入測試模組
        const { runCacheFaultToleranceTest } = await import('./test-cache-fault-tolerance.js');
        const result = await runCacheFaultToleranceTest();

        return { success: result, skipped: false };
    } catch (error) {
        log(`❌ 快取故障容錯測試執行失敗: ${error.message}`, 'red');
        return { success: false, skipped: false, error: error.message };
    }
}

/**
 * 生成綜合測試報告
 */
function generateComprehensiveReport() {
    const report = {
        ...testResults,
        summary: {
            total: testResults.suites.length,
            passed: testResults.suites.filter(s => s.success).length,
            failed: testResults.suites.filter(s => !s.success).length,
            successRate: testResults.suites.length > 0 ?
                (testResults.suites.filter(s => s.success).length / testResults.suites.length * 100).toFixed(1) : 0
        }
    };

    const reportPath = path.join(__dirname, 'comprehensive-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    log(`📄 綜合測試報告已生成: ${reportPath}`, 'cyan');

    return report;
}

/**
 * 顯示測試結果
 */
function displayResults() {
    logSection('測試結果總結');

    testResults.suites.forEach(suite => {
        const status = suite.success ? '✅ PASS' : '❌ FAIL';
        const color = suite.success ? 'green' : 'red';
        log(`${status} ${suite.name}`, color);

        if (suite.skipped) {
            log('   (已跳過)', 'yellow');
        } else if (suite.details) {
            log(`   ${suite.details}`, 'cyan');
        }
    });

    const summary = testResults.summary;
    log(`\n📊 總體統計:`, 'magenta');
    log(`總測試套件: ${summary.total}`, 'cyan');
    log(`通過: ${summary.passed}`, 'green');
    log(`失敗: ${summary.failed}`, 'red');
    log(`成功率: ${summary.successRate}%`, summary.successRate >= 80 ? 'green' : 'yellow');

    if (summary.failed === 0) {
        log('\n🎉 所有測試套件通過！後端系統運行正常。', 'green');
    } else {
        log('\n⚠️ 部分測試失敗，請檢查相關功能。', 'yellow');
    }
}

/**
 * 主執行函數
 */
async function runAllTestSuites() {
    log('🚀 開始執行所有測試套件', 'magenta');
    log(`執行時間: ${new Date().toLocaleString()}`, 'cyan');

    // 1. API 測試套件
    logSection('API 測試套件');
    try {
        const apiTestResult = await runAllTests();
        testResults.suites.push({
            name: 'API 測試套件',
            success: apiTestResult,
            details: '檢查後端 API 功能與 Swagger 文檔一致性'
        });
    } catch (error) {
        log(`❌ API 測試套件執行失敗: ${error.message}`, 'red');
        testResults.suites.push({
            name: 'API 測試套件',
            success: false,
            error: error.message
        });
    }

    // 2. Swagger 驗證測試
    logSection('Swagger 文檔驗證');
    try {
        const swaggerTestResult = await runSwaggerValidation();
        testResults.suites.push({
            name: 'Swagger 文檔驗證',
            success: swaggerTestResult,
            details: '驗證後端 API 與 Swagger 文檔的一致性'
        });
    } catch (error) {
        log(`❌ Swagger 驗證執行失敗: ${error.message}`, 'red');
        testResults.suites.push({
            name: 'Swagger 文檔驗證',
            success: false,
            error: error.message
        });
    }

    // 3. 快取故障容錯測試
    const cacheTestResult = await runCacheFaultToleranceTest();
    testResults.suites.push({
        name: '快取故障容錯測試',
        success: cacheTestResult.success,
        skipped: cacheTestResult.skipped,
        details: cacheTestResult.error || '測試快取服務的故障容錯機制'
    });

    // 生成報告
    generateComprehensiveReport();

    // 顯示結果
    displayResults();

    // 返回整體結果
    const allPassed = testResults.suites.every(suite => suite.success || suite.skipped);
    return allPassed;
}

/**
 * 檢查依賴
 */
async function checkDependencies() {
    logSection('檢查測試依賴');

    const requiredDeps = ['axios', 'js-yaml'];
    const missingDeps = [];

    for (const dep of requiredDeps) {
        try {
            await import(dep);
            log(`✅ ${dep}`, 'green');
        } catch (error) {
            missingDeps.push(dep);
            log(`❌ ${dep} (缺失)`, 'red');
        }
    }

    if (missingDeps.length > 0) {
        log(`\n⚠️ 缺少依賴: ${missingDeps.join(', ')}`, 'yellow');
        log('請執行: npm install axios js-yaml', 'cyan');
        return false;
    }

    log('\n✅ 所有依賴檢查通過', 'green');
    return true;
}

/**
 * 檢查服務狀態
 */
async function checkServiceStatus() {
    logSection('檢查服務狀態');

    try {
        const axios = (await import('axios')).default;
        const response = await axios.get('http://localhost:3000/health-check', {
            timeout: 5000
        });

        if (response.status === 200) {
            log('✅ 後端服務運行正常', 'green');
            return true;
        } else {
            log(`⚠️ 後端服務回應異常: ${response.status}`, 'yellow');
            return false;
        }
    } catch (error) {
        log('❌ 後端服務無法連接', 'red');
        log('請確保後端服務正在運行: npm run dev', 'cyan');
        return false;
    }
}

// 執行測試
async function main() {
    try {
        log('🔍 開始測試環境檢查', 'blue');

        // 檢查依賴
        const depsOk = await checkDependencies();
        if (!depsOk) {
            log('❌ 依賴檢查失敗，無法繼續測試', 'red');
            process.exit(1);
        }

        // 檢查服務狀態
        const serviceOk = await checkServiceStatus();
        if (!serviceOk) {
            log('❌ 服務檢查失敗，無法繼續測試', 'red');
            process.exit(1);
        }

        // 執行所有測試
        const success = await runAllTestSuites();

        // 延遲一下讓日誌完整輸出
        await new Promise(resolve => setTimeout(resolve, 1000));

        process.exit(success ? 0 : 1);
    } catch (error) {
        log(`❌ 測試執行器失敗: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 如果直接執行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { runAllTestSuites };
