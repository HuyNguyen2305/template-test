export async function seedWithTransaction(sequelize, fn) {
  const transaction = await sequelize.transaction();

  try {
    await fn(transaction);
  } finally {
    await transaction.rollback();
  }
}
