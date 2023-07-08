import { FastifyInstance } from 'fastify'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return { message: 'meals route' }
  })
}
