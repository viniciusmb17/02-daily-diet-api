import { FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'

export async function getUserBySessionId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sessionId } = request.cookies

  const user = await knex('users')
    .where({
      session_id: sessionId,
    })
    .select()
    .first()

  if (!user) {
    return reply.status(404).send({ message: 'User não encontrado' })
  }

  request.user = user
}
