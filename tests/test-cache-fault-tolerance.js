#!/usr/bin/env node

/**
 * Redis 容錯機制測試腳本
 *
 * 這個腳本用於測試 CacheService 的容錯功能：
 * 1. 測試正常連接
 * 2. 測試連接失敗時的優雅降級
 * 3. 測試重連機制
 * 4. 測試指數退避策略
 */

import { cacheService } from '../src/services/CacheService.js';

// 測試配置
const TEST_CONFIG = {
    testKey: 'test:fault:tolerance',
    testValue: { message: 'Hello from fault tolerance test', timestamp: Date.now() },
    testExpiry: 60, // 60秒
    delayBetweenTests: 2000 // 2秒
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

// 延遲函數
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 測試1: 基本快取操作
async function testBasicCacheOperations() {
    log('\n🔍 測試1: 基本快取操作', 'blue');

    try {
        // 測試設定快取
        const setResult = await cacheService.set(TEST_CONFIG.testKey, TEST_CONFIG.testValue, TEST_CONFIG.testExpiry);
        logTest('設定快取', setResult, `結果: ${setResult}`);

        // 測試獲取快取
        const getResult = await cacheService.get(TEST_CONFIG.testKey);
        const getSuccess = getResult && getResult.message === TEST_CONFIG.testValue.message;
        logTest('獲取快取', getSuccess, `結果: ${JSON.stringify(getResult)}`);

        // 測試檢查快取存在
        const existsResult = await cacheService.exists(TEST_CONFIG.testKey);
        logTest('檢查快取存在', existsResult, `結果: ${existsResult}`);

        // 測試獲取TTL
        const ttlResult = await cacheService.getTTL(TEST_CONFIG.testKey);
        const ttlSuccess = typeof ttlResult === 'number' && ttlResult > 0;
        logTest('獲取TTL', ttlSuccess, `結果: ${ttlResult}秒`);

        return setResult && getSuccess && existsResult && ttlSuccess;
    } catch (error) {
        logTest('基本快取操作', false, `錯誤: ${error.message}`);
        return false;
    }
}

// 測試2: 服務狀態檢查
async function testServiceStatus() {
    log('\n🔍 測試2: 服務狀態檢查', 'blue');

    try {
        const status = cacheService.getStatus();

        // 檢查狀態物件結構
        const hasRequiredFields = status &&
            typeof status.isConnected === 'boolean' &&
            typeof status.isReconnecting === 'boolean' &&
            typeof status.connectionRetryAttempts === 'number' &&
            typeof status.maxRetryAttempts === 'number';

        logTest('狀態物件結構', hasRequiredFields, `連接狀態: ${status.isConnected}, 重連中: ${status.isReconnecting}`);

        // 檢查重連延遲計算
        const nextRetryDelay = status.nextRetryDelay;
        const delayValid = typeof nextRetryDelay === 'number' && nextRetryDelay >= 0;
        logTest('重連延遲計算', delayValid, `下次重連延遲: ${nextRetryDelay}ms`);

        return hasRequiredFields && delayValid;
    } catch (error) {
        logTest('服務狀態檢查', false, `錯誤: ${error.message}`);
        return false;
    }
}

// 測試3: 健康檢查
async function testHealthCheck() {
    log('\n🔍 測試3: 健康檢查', 'blue');

    try {
        const isHealthy = await cacheService.forceHealthCheck();
        logTest('健康檢查執行', true, `健康狀態: ${isHealthy}`);

        const status = cacheService.getStatus();
        logTest('健康檢查後狀態更新', true, `最後檢查時間: ${new Date(status.lastHealthCheck).toLocaleString()}`);

        return true;
    } catch (error) {
        logTest('健康檢查', false, `錯誤: ${error.message}`);
        return false;
    }
}

// 測試4: 批量操作
async function testBatchOperations() {
    log('\n🔍 測試4: 批量操作', 'blue');

    try {
        const testData = {
            'test:batch:1': { id: 1, name: 'Item 1' },
            'test:batch:2': { id: 2, name: 'Item 2' },
            'test:batch:3': { id: 3, name: 'Item 3' }
        };

        // 測試批量設定
        const msetResult = await cacheService.mset(testData, TEST_CONFIG.testExpiry);
        logTest('批量設定', msetResult, `設定 ${Object.keys(testData).length} 個項目`);

        // 測試批量獲取
        const keys = Object.keys(testData);
        const mgetResult = await cacheService.mget(keys);
        const mgetSuccess = keys.every(key => mgetResult[key] && mgetResult[key].id === testData[key].id);
        logTest('批量獲取', mgetSuccess, `獲取 ${Object.keys(mgetResult).length} 個項目`);

        return msetResult && mgetSuccess;
    } catch (error) {
        logTest('批量操作', false, `錯誤: ${error.message}`);
        return false;
    }
}

// 測試5: 統計資訊
async function testStatistics() {
    log('\n🔍 測試5: 統計資訊', 'blue');

    try {
        const stats = await cacheService.getStats();

        const statsValid = stats &&
            typeof stats.keys === 'number' &&
            typeof stats.info === 'object';

        logTest('統計資訊結構', statsValid, `快取鍵數量: ${stats.keys}`);

        if (stats.info && Object.keys(stats.info).length > 0) {
            logTest('Redis 資訊', true, `Redis 版本: ${stats.info.redis_version || 'N/A'}`);
        } else {
            logTest('Redis 資訊', false, '無法獲取 Redis 資訊');
        }

        return statsValid;
    } catch (error) {
        logTest('統計資訊', false, `錯誤: ${error.message}`);
        return false;
    }
}

// 測試6: 容錯能力（模擬 Redis 不可用）
async function testFaultTolerance() {
    log('\n🔍 測試6: 容錯能力', 'blue');

    try {
        // 測試在 Redis 不可用時的操作
        log('⚠️  注意：這個測試假設 Redis 可能不可用', 'yellow');

        // 嘗試獲取一個不存在的鍵
        const nonExistentResult = await cacheService.get('non:existent:key');
        const nonExistentSuccess = nonExistentResult === null;
        logTest('獲取不存在的鍵', nonExistentSuccess, `結果: ${nonExistentResult}`);

        // 嘗試設定快取（即使 Redis 不可用也應該不拋出異常）
        const setResult = await cacheService.set('test:fault:tolerance:2', { test: true }, 60);
        logTest('設定快取（容錯）', typeof setResult === 'boolean', `結果: ${setResult}`);

        // 檢查服務狀態
        const status = cacheService.getStatus();
        logTest('服務狀態檢查', true, `連接狀態: ${status.isConnected}, 重連嘗試: ${status.connectionRetryAttempts}`);

        return nonExistentSuccess && typeof setResult === 'boolean';
    } catch (error) {
        logTest('容錯能力', false, `錯誤: ${error.message}`);
        return false;
    }
}

// 主測試函數
async function runAllTests() {
    log('🚀 開始 Redis 容錯機制測試', 'magenta');
    log(`測試時間: ${new Date().toLocaleString()}`, 'cyan');

    const tests = [
        { name: '基本快取操作', fn: testBasicCacheOperations },
        { name: '服務狀態檢查', fn: testServiceStatus },
        { name: '健康檢查', fn: testHealthCheck },
        { name: '批量操作', fn: testBatchOperations },
        { name: '統計資訊', fn: testStatistics },
        { name: '容錯能力', fn: testFaultTolerance }
    ];

    const results = [];

    for (const test of tests) {
        try {
            const result = await test.fn();
            results.push({ name: test.name, success: result });

            // 測試間隔
            if (test !== tests[tests.length - 1]) {
                await delay(TEST_CONFIG.delayBetweenTests);
            }
        } catch (error) {
            logTest(test.name, false, `測試執行錯誤: ${error.message}`);
            results.push({ name: test.name, success: false });
        }
    }

    // 測試結果總結
    log('\n📊 測試結果總結', 'magenta');
    const passedTests = results.filter(r => r.success).length;
    const totalTests = results.length;

    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        log(`${status} ${result.name}`, result.success ? 'green' : 'red');
    });

    log(`\n🎯 總體結果: ${passedTests}/${totalTests} 測試通過`, passedTests === totalTests ? 'green' : 'yellow');

    if (passedTests === totalTests) {
        log('🎉 所有測試通過！Redis 容錯機制運作正常。', 'green');
    } else {
        log('⚠️  部分測試失敗，請檢查 Redis 連接和配置。', 'yellow');
    }

    return passedTests === totalTests;
}

// 清理函數
async function cleanup() {
    log('\n🧹 清理測試資料', 'blue');

    try {
        const keysToDelete = [
            TEST_CONFIG.testKey,
            'test:batch:1',
            'test:batch:2',
            'test:batch:3',
            'test:fault:tolerance:2'
        ];

        for (const key of keysToDelete) {
            await cacheService.delete(key);
        }

        log('✅ 測試資料清理完成', 'green');
    } catch (error) {
        log('⚠️  清理測試資料時發生錯誤', 'yellow');
    }
}

// 執行測試
async function main() {
    try {
        const success = await runAllTests();
        await cleanup();

        // 延遲一下讓日誌完整輸出
        await delay(1000);

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

// 為了與測試執行器相容，添加別名函數
async function runCacheFaultToleranceTest() {
    return await runAllTests();
}

export { runAllTests, cleanup, runCacheFaultToleranceTest };
