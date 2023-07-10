import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { getUserBySessionId } from '../middlewares/get-user-by-session-id'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const users = await knex('users')
      .where({
        session_id: sessionId,
      })
      .select()

    return { users }
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
    })

    const { username } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      username,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/overview',
    { preHandler: [checkSessionIdExists, getUserBySessionId] },
    async (request, reply) => {
      const { user } = request

      const meals = await knex('meals')
        .where({
          user_id: user?.id,
        })
        .select()

      const totalMeals = meals.length
      const totalMealsOnTheDiet = meals.filter(
        (meal) => meal.is_on_the_diet,
      ).length
      const totalMealsNotOnTheDiet = meals.filter(
        (meal) => !meal.is_on_the_diet,
      ).length

      const bestSequenceOnTheDiet = getBestSequenceOnTheDiet(meals)

      const overview = {
        totalMeals,
        totalMealsOnTheDiet,
        totalMealsNotOnTheDiet,
        bestSequenceOnTheDiet,
      }

      return {
        user,
        overview,
      }
    },
  )
}

type MealsType = {
  id: string
  name: string
  description: string
  date: string
  is_on_the_diet: boolean
  created_at: string
  user_id: string
}[]

function getBestSequenceOnTheDiet(meals: MealsType) {
  const sequences: number[] = []
  let counter = 0

  if (meals.length === 0) {
    return 0
  }

  meals.forEach((meal) => {
    if (meal.is_on_the_diet) {
      counter++
    } else {
      sequences.push(counter)
      counter = 0
    }
  })

  return Math.max(...sequences)
}
