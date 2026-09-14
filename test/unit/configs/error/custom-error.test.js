import { describe, expect, test } from '@jest/globals';
import {
  CustomError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from '#configs/error/index.js';

describe('CustomError', () => {
  test('defaults to a 500 internal error', () => {
    const error = new CustomError('boom');

    expect(error.message).toBe('boom');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error).toBeInstanceOf(Error);
  });

  test('accepts a custom status code and code', () => {
    const error = new CustomError('nope', 418, 'TEAPOT');

    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
  });
});

describe('NotFoundError', () => {
  test('defaults to 404', () => {
    const error = new NotFoundError();

    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error).toBeInstanceOf(CustomError);
  });
});

describe('ValidationError', () => {
  test('defaults to 400', () => {
    const error = new ValidationError();

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});

describe('UnauthorizedError', () => {
  test('defaults to 401', () => {
    const error = new UnauthorizedError();

    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });
});
