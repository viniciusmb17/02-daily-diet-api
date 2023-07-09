// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FastifyRequest } from 'fastify'

interface User {
  id: string
  username: string
  session_id?: string
  created_at: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: User
  }
}
