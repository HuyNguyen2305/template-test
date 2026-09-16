import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import autoload from '@fastify/autoload';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import { fastifyRequestContext } from '@fastify/request-context';
import { CustomError } from '#configs/error/index.js';
import { registerContainer } from './containter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function buildApp() {
  const fastify = Fastify({ logger: true });

  fastify.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
  });

  fastify.register(fastifyRequestContext);

  fastify.register(autoload, {
    dir: path.join(__dirname, 'routers'),
  });

  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      message: `Route ${request.method}:${request.url} not found`,
    });
  });

  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof CustomError) {
      reply
        .status(error.statusCode)
        .send({ success: false, message: error.message });
      return;
    }
    if (error.statusCode && error.statusCode < 500) {
      reply
        .status(error.statusCode)
        .send({ success: false, message: error.message });
      return;
    }
    request.log.error(error);
    reply
      .status(500)
      .send({ success: false, message: 'Internal server error' });
  });

  registerContainer();

  return fastify;
}
