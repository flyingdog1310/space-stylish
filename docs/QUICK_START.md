# 重構快速開始指南

## 立即開始

### 1. 備份當前專案
```bash
# 創建備份分支
git checkout -b backup-before-refactor
git push origin backup-before-refactor

# 回到主分支
git checkout main
```

### 2. 安裝測試依賴
```bash
npm install --save-dev jest supertest @types/jest
```

### 3. 創建 Jest 配置文件
```bash
# 創建 jest.config.js
cat > jest.config.js << 'EOF'
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
EOF
```

### 4. 更新 package.json 腳本
```bash
# 在 package.json 的 scripts 部分添加：
cat >> package.json << 'EOF'
  "scripts": {
    "dev": "node --env-file=.env app.js",
    "test": "node --experimental-vm-modules node_modules/.bin/jest",
    "test:watch": "node --experimental-vm-modules node_modules/.bin/jest --watch",
    "test:coverage": "node --experimental-vm-modules node_modules/.bin/jest --coverage"
  }
EOF
```

### 5. 創建基礎測試目錄
```bash
mkdir -p tests/{unit,integration,fixtures}
```

### 6. 創建第一個測試文件
```bash
# 創建 API 健康檢查測試
cat > tests/integration/health.test.js << 'EOF'
import request from 'supertest';
import { app } from '../../app.js';

describe('Health Check API', () => {
  test('GET /health-check should return 200', async () => {
    const response = await request(app).get('/health-check');
    expect(response.status).toBe(200);
    expect(response.text).toBe('ok');
  });
});
EOF
```

### 7. 修改 app.js 以支援測試
```bash
# 在 app.js 末尾添加：
cat >> app.js << 'EOF'

// Export for testing
export { app };
EOF
```

### 8. 執行第一個測試
```bash
npm test
```

## 下一步行動

### 如果測試通過，繼續以下步驟：

1. **創建新的目錄結構**：
```bash
mkdir -p src/{config,routes,controllers,services,middleware,utils}
```

2. **移動現有文件**：
```bash
# 移動控制器
mv controllers/* src/controllers/

# 移動模型
mv models/* src/models/

# 移動工具函數
mv util/* src/utils/
```

3. **更新 import 路徑**：
```bash
# 在所有文件中更新 import 路徑
# 例如：從 '../util/mysql.js' 改為 '../utils/mysql.js'
```

### 如果測試失敗，請檢查：

1. **環境變數**：確保 `.env` 文件存在且包含必要的變數
2. **依賴安裝**：確保所有依賴都已正確安裝
3. **Node.js 版本**：確保使用支援 ES modules 的 Node.js 版本

## 常見問題解決

### 問題 1：Jest 無法處理 ES modules
**解決方案**：
```bash
# 在 package.json 中添加：
"type": "module"
```

### 問題 2：Import 路徑錯誤
**解決方案**：
```bash
# 使用絕對路徑或相對路徑
import { pool } from '../utils/mysql.js';
```

### 問題 3：環境變數未定義
**解決方案**：
```bash
# 創建 .env.test 文件用於測試
cp .env .env.test
# 修改測試環境的變數值
```

## 驗證清單

在繼續下一步之前，請確認：

- [ ] 所有測試通過
- [ ] 應用正常啟動
- [ ] API 端點正常響應
- [ ] 資料庫連接正常
- [ ] 沒有控制台錯誤

## 聯繫支援

如果遇到問題：

1. 檢查錯誤日誌
2. 查看 Jest 測試輸出
3. 確認環境配置
4. 參考完整重構計劃文檔

## 下一步

完成基礎設置後，請參考 `REFACTOR_PLAN.md` 和 `REFACTOR_CHECKLIST.md` 繼續重構過程。
