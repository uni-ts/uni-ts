import { describe, expect, it } from 'vitest';
import { ModelValidationError, prettifyError } from './error.js';
import type { StandardSchemaV1 } from './standard-schema.js';

describe('error.ts', () => {
  describe('ModelValidationError', () => {
    it('extends Error with correct name and type', () => {
      const issues: StandardSchemaV1.Issue[] = [];
      const error = new ModelValidationError(issues);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ModelValidationError);
      expect(error.name).toBe('ModelValidationError');
      expect(error.type).toBe('ModelValidationError');
    });

    it('stores issues array correctly', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Invalid email format', path: ['email'] },
        { message: 'String must contain at least 1 character(s)', path: ['name'] },
      ];
      const error = new ModelValidationError(issues);

      expect(error.issues).toEqual(issues);
      expect(error.issues).toHaveLength(2);
    });

    it('creates a JSON formatted error message', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Invalid email format', path: ['email'] },
        { message: 'Required field is missing', path: ['name'] },
      ];
      const error = new ModelValidationError(issues);

      const parsedMessage = JSON.parse(error.message);
      expect(parsedMessage).toEqual([
        { message: 'Invalid email format', path: 'email' },
        { message: 'Required field is missing', path: 'name' },
      ]);
    });

    it('handles issues without path', () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: 'Root validation failed' }];
      const error = new ModelValidationError(issues);

      expect(error.issues).toEqual(issues);
      const parsedMessage = JSON.parse(error.message);
      expect(parsedMessage).toEqual([{ message: 'Root validation failed', path: '' }]);
    });

    it('handles complex nested paths', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Invalid value', path: ['users', 0, 'profile', 'settings'] },
        { message: 'Array index out of bounds', path: ['items', 5] },
      ];
      const error = new ModelValidationError(issues);

      const parsedMessage = JSON.parse(error.message);
      expect(parsedMessage).toEqual([
        { message: 'Invalid value', path: 'users[0].profile.settings' },
        { message: 'Array index out of bounds', path: 'items[5]' },
      ]);
    });

    it('handles path segments with special characters', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Invalid key', path: ['user-name'] },
        { message: 'Invalid symbol', path: [Symbol('test')] },
      ];
      const error = new ModelValidationError(issues);

      const parsedMessage = JSON.parse(error.message);
      expect(parsedMessage).toHaveLength(2);
      expect(parsedMessage[0]).toEqual({ message: 'Invalid key', path: '["user-name"]' });
      expect(parsedMessage[1].message).toBe('Invalid symbol');
      expect(parsedMessage[1].path).toMatch(/\["Symbol\(test\)"\]/);
    });
  });

  describe('prettifyError', () => {
    it('formats single error without path', () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: 'Root validation failed' }];
      const error = new ModelValidationError(issues);

      const result = prettifyError(error);
      expect(result).toBe('✖ Root validation failed');
    });

    it('formats single error with simple path', () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: 'Required field is missing', path: ['name'] }];
      const error = new ModelValidationError(issues);

      const result = prettifyError(error);
      expect(result).toBe('✖ Required field is missing\n  → at name');
    });

    it('formats multiple errors with different paths', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Invalid email format', path: ['email'] },
        { message: 'String must contain at least 1 character(s)', path: ['name'] },
        { message: 'Must be greater than 0', path: ['age'] },
      ];
      const error = new ModelValidationError(issues);

      const result = prettifyError(error);
      expect(result).toBe(
        '✖ Invalid email format\n' +
          '  → at email\n' +
          '✖ String must contain at least 1 character(s)\n' +
          '  → at name\n' +
          '✖ Must be greater than 0\n' +
          '  → at age',
      );
    });

    it('formats nested object path correctly', () => {
      const issues: StandardSchemaV1.Issue[] = [{ message: 'Invalid value', path: ['user', 'profile', 'settings'] }];
      const error = new ModelValidationError(issues);

      const result = prettifyError(error);
      expect(result).toBe('✖ Invalid value\n  → at user.profile.settings');
    });

    it('formats array index paths correctly', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Invalid item', path: ['items', 0] },
        { message: 'Missing property', path: ['users', 5, 'name'] },
      ];
      const error = new ModelValidationError(issues);

      const result = prettifyError(error);
      expect(result).toBe('✖ Invalid item\n' + '  → at items[0]\n' + '✖ Missing property\n' + '  → at users[5].name');
    });

    it('handles symbol paths', () => {
      const testSymbol = Symbol('testKey');
      const issues: StandardSchemaV1.Issue[] = [{ message: 'Invalid symbol property', path: [testSymbol] }];
      const error = new ModelValidationError(issues);

      const result = prettifyError(error);
      expect(result).toContain('✖ Invalid symbol property\n  → at ["Symbol(testKey)"]');
    });

    it('handles mixed path types correctly', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Complex path error', path: ['data', 0, 'items', 'sub-field', 2] },
      ];
      const error = new ModelValidationError(issues);

      const result = prettifyError(error);
      expect(result).toBe('✖ Complex path error\n  → at data[0].items["sub-field"][2]');
    });

    it('handles PathSegment objects in paths', () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: 'Invalid value',
          path: ['parent', { key: 'dynamicKey' }, 'child'],
        },
      ];
      const error = new ModelValidationError(issues);

      const result = prettifyError(error);
      expect(result).toBe('✖ Invalid value\n  → at parent.dynamicKey.child');
    });
  });
});
