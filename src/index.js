import 'dotenv/config';
import { buildApp } from './app.js';

const fastify = buildApp();

fastify.listen({ port: Number(process.env.PORT) || 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await fastify.close();
    process.exit(0);
  });
}
