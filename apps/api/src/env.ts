import { config } from 'dotenv'
import { resolve } from 'path'
import { z } from 'zod'

config({ path: resolve(process.cwd(), '.env') })
config({ path: resolve(process.cwd(), '../../.env') })

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
})

export const env = envSchema.parse(process.env)
