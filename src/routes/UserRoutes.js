import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { verifyJWT } from '../middlewares/auth.js';

const router = express.Router();
const userController = new UserController();

// 公開路由
router.post('/signup', userController.signUp.bind(userController));
router.post('/signin', userController.signIn.bind(userController));

// 頁面渲染路由
router.get('/page/profile', userController.renderProfilePage.bind(userController));
router.get('/page/roles', userController.renderRolesPage.bind(userController));

// 需要認證的路由
router.get('/profile', verifyJWT, userController.getUserProfile.bind(userController));
router.put('/profile', verifyJWT, userController.updateUserProfile.bind(userController));

export default router;
