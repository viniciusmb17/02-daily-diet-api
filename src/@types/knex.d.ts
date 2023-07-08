// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id?: string
      created_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      is_on_the_diet: boolean
      created_at: string
      user_id: string
    }
  }
}
