import { dbManager } from '../../src/config/database.js';

describe('Database Connection', () => {
  test('should connect to database successfully', async () => {
    try {
      const result = await dbManager.testConnection();
      expect(result).toBe(true);
    } catch (error) {
      fail('Database connection failed: ' + error.message);
    }
  });

  test('should handle database query error gracefully', async () => {
    try {
      await dbManager.query('SELECT * FROM non_existent_table');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('Table');
    }
  });

  afterAll(async () => {
    await dbManager.closePool();
  });
});
