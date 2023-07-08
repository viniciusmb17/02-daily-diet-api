import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { format } from 'date-fns'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return { message: 'meals route' }
  })
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
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

      const createMealBodySchema = z
        .object({
          name: z
            .string()
            .min(3, { message: 'Necessário pelo menos 3 caracteres' }),
          description: z
            .string()
            .min(3, { message: 'Necessário pelo menos 3 caracteres' }),
          date: z.coerce.date(),
          isOnTheDiet: z.boolean(),
        })
        .transform(({ name, description, isOnTheDiet, date }) => {
          const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss')

          return {
            name,
            description,
            isOnTheDiet,
            date: formattedDate,
          }
        })

      const { name, description, date, isOnTheDiet } =
        createMealBodySchema.parse(request.body)

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        date,
        is_on_the_diet: isOnTheDiet,
        user_id: user?.id,
      })

      return reply.status(201).send()
    },
  )
}
