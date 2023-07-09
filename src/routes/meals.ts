import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { getUserBySessionId } from '../middlewares/get-user-by-session-id'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { format } from 'date-fns'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return { message: 'meals route' }
  })

  app.post(
    '/',
    { preHandler: [checkSessionIdExists, getUserBySessionId] },
    async (request, reply) => {
      const { user } = request

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

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists, getUserBySessionId] },
    async (request, reply) => {
      const { user } = request

      const updateMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const updateMealsBodySchema = z
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

      const { id } = updateMealsParamsSchema.parse(request.params)

      const { name, description, date, isOnTheDiet } =
        updateMealsBodySchema.parse(request.body)

      await knex('meals')
        .where({
          id,
          user_id: user?.id,
        })
        .first()
        .update({
          name,
          description,
          date,
          is_on_the_diet: isOnTheDiet,
        })

      return reply.status(204).send()
    },
  )
}
