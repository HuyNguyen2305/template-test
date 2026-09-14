import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

const requestContext = {
  get: jest.fn(),
  set: jest.fn(),
};

jest.unstable_mockModule('@fastify/request-context', () => ({
  requestContext,
}));

const { getIdentity, setIdentity, getSchemaName } =
  await import('#common/request-context.js');

describe('request-context', () => {
  const originalDefaultTenantSchema = process.env.DEFAULT_TENANT_SCHEMA;

  afterEach(() => {
    jest.clearAllMocks();
    process.env.DEFAULT_TENANT_SCHEMA = originalDefaultTenantSchema;
  });

  describe('setIdentity / getIdentity', () => {
    test('setIdentity stores the identity in the request context', () => {
      setIdentity({ schemaName: 'tenant_a' });

      expect(requestContext.set).toHaveBeenCalledWith('identity', {
        schemaName: 'tenant_a',
      });
    });

    test('getIdentity returns the stored identity', () => {
      requestContext.get.mockReturnValue({ schemaName: 'tenant_a' });

      const result = getIdentity();

      expect(requestContext.get).toHaveBeenCalledWith('identity');
      expect(result).toEqual({ schemaName: 'tenant_a' });
    });

    test('getIdentity returns an empty object when nothing is stored', () => {
      requestContext.get.mockReturnValue(undefined);

      const result = getIdentity();

      expect(result).toEqual({});
    });
  });

  describe('getSchemaName', () => {
    beforeEach(() => {
      delete process.env.DEFAULT_TENANT_SCHEMA;
    });

    test('prefers the identity schemaName when set', () => {
      requestContext.get.mockReturnValue({ schemaName: 'tenant_a' });
      process.env.DEFAULT_TENANT_SCHEMA = 'tenant_default';

      expect(getSchemaName()).toBe('tenant_a');
    });

    test('falls back to DEFAULT_TENANT_SCHEMA when identity has none', () => {
      requestContext.get.mockReturnValue({});
      process.env.DEFAULT_TENANT_SCHEMA = 'tenant_default';

      expect(getSchemaName()).toBe('tenant_default');
    });

    test("falls back to 'public' when neither is set", () => {
      requestContext.get.mockReturnValue({});

      expect(getSchemaName()).toBe('public');
    });
  });
});
