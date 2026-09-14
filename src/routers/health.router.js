export default async function healthRouter(fastify) {
  fastify.get('/health', async (request, reply) => {
    await fastify.diContainer.resolve('sequelize').authenticate();
    reply.send({ success: true, message: 'ok', data: null });
  });
}
