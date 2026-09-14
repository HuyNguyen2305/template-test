import { requestContext } from '@fastify/request-context';

export function getIdentity() {
  return requestContext.get('identity') || {};
}

export function setIdentity(identity) {
  requestContext.set('identity', identity);
}

export function getSchemaName() {
  const identity = getIdentity();
  return identity.schemaName || process.env.DEFAULT_TENANT_SCHEMA || 'public';
}
