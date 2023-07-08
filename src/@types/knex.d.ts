// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      username: string
      session_id?: string
      created_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      date: string
      is_on_the_diet: boolean
      created_at: string
      user_id: string
    }
  }
}
