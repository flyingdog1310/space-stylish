import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from '../utils/errors.js';

// 確保上傳目錄存在
const createUploadDirs = () => {
    const dirs = [
        'uploads',
        'uploads/products',
        'uploads/campaigns',
        'uploads/avatars',
        'uploads/temp'
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// 檔案類型驗證
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

/**
 * 檔案類型驗證
 * @param {string} mimetype - MIME類型
 * @param {Array} allowedTypes - 允許的類型
 * @returns {boolean} 是否有效
 */
const validateFileType = (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
};

/**
 * 檔案大小驗證
 * @param {number} size - 檔案大小
 * @param {number} maxSize - 最大大小
 * @returns {boolean} 是否有效
 */
const validateFileSize = (size, maxSize) => {
    return size <= maxSize;
};

// 儲存配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/temp';

        // 根據檔案類型決定儲存路徑
        if (file.fieldname === 'productImage') {
            uploadPath = 'uploads/products';
        } else if (file.fieldname === 'campaignImage') {
            uploadPath = 'uploads/campaigns';
        } else if (file.fieldname === 'avatar') {
            uploadPath = 'uploads/avatars';
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // 生成唯一檔名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);

        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// 檔案過濾器
const fileFilter = (req, file, cb) => {
    // 檢查檔案類型
    if (!validateFileType(file.mimetype, allowedImageTypes)) {
        return cb(new ValidationError(`Invalid file type. Allowed types: ${allowedImageTypes.join(', ')}`), false);
    }

    // 檢查檔案大小
    if (!validateFileSize(file.size, maxFileSize)) {
        return cb(new ValidationError(`File too large. Maximum size: ${maxFileSize / (1024 * 1024)}MB`), false);
    }

    cb(null, true);
};

// 創建multer實例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: maxFileSize,
        files: 10 // 最多10個檔案
    }
});

/**
 * 單一檔案上傳中間件
 * @param {string} fieldName - 欄位名稱
 * @returns {Function} 中間件函數
 */
export const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                if (err instanceof ValidationError) {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: 'File upload failed'
                });
            }

            // 檢查是否有檔案上傳
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            // 添加檔案資訊到請求物件
            req.uploadedFile = {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            };

            next();
        });
    };
};

/**
 * 多檔案上傳中間件
 * @param {string} fieldName - 欄位名稱
 * @param {number} maxCount - 最大檔案數量
 * @returns {Function} 中間件函數
 */
export const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                if (err instanceof ValidationError) {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: 'File upload failed'
                });
            }

            // 檢查是否有檔案上傳
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }

            // 添加檔案資訊到請求物件
            req.uploadedFiles = req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path
            }));

            next();
        });
    };
};

/**
 * 產品圖片上傳中間件
 * @returns {Function} 中間件函數
 */
export const uploadProductImage = uploadSingle('productImage');

/**
 * 行銷活動圖片上傳中間件
 * @returns {Function} 中間件函數
 */
export const uploadCampaignImage = uploadSingle('campaignImage');

/**
 * 用戶頭像上傳中間件
 * @returns {Function} 中間件函數
 */
export const uploadAvatar = uploadSingle('avatar');

/**
 * 刪除檔案
 * @param {string} filePath - 檔案路徑
 * @returns {Promise<boolean>} 是否成功刪除
 */
export const deleteFile = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to delete file:', error);
        return false;
    }
};

/**
 * 移動檔案
 * @param {string} sourcePath - 來源路徑
 * @param {string} destPath - 目標路徑
 * @returns {Promise<boolean>} 是否成功移動
 */
export const moveFile = async (sourcePath, destPath) => {
    try {
        // 確保目標目錄存在
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.renameSync(sourcePath, destPath);
        return true;
    } catch (error) {
        console.error('Failed to move file:', error);
        return false;
    }
};

/**
 * 清理臨時檔案
 * @param {string} tempDir - 臨時目錄
 * @param {number} maxAge - 最大年齡（毫秒）
 * @returns {Promise<void>}
 */
export const cleanupTempFiles = async (tempDir = 'uploads/temp', maxAge = 24 * 60 * 60 * 1000) => {
    try {
        if (!fs.existsSync(tempDir)) {
            return;
        }

        const files = fs.readdirSync(tempDir);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up temp file: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Failed to cleanup temp files:', error);
    }
};
