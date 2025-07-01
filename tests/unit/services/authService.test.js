import authService from '../../../src/services/authService.js';

describe('AuthService', () => {
    describe('validateEmail', () => {
        test('should validate correct email format', () => {
            expect(authService.validateEmail('test@example.com')).toBe(true);
            expect(authService.validateEmail('user123@gmail.com')).toBe(true);
        });

        test('should reject invalid email format', () => {
            expect(authService.validateEmail('invalid-email')).toBe(false);
            expect(authService.validateEmail('test@')).toBe(false);
            expect(authService.validateEmail('@example.com')).toBe(false);
        });
    });

    describe('generateToken', () => {
        test('should generate valid JWT token', () => {
            const userId = 123;
            const provider = 'native';
            const token = authService.generateToken(userId, provider);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });
    });

    describe('verifyToken', () => {
        test('should verify valid token', () => {
            const userId = 123;
            const provider = 'native';
            const token = authService.generateToken(userId, provider);

            const decoded = authService.verifyToken(token);
            expect(decoded.userId).toBe(userId);
            expect(decoded.provider).toBe(provider);
        });

        test('should throw error for invalid token', () => {
            expect(() => {
                authService.verifyToken('invalid-token');
            }).toThrow('Invalid token');
        });
    });
});
