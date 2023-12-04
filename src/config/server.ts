import 'dotenv/config'

export const dev = {
  app: { port: Number(process.env.PORT) || 3000 },
  db: {
    url: process.env.ATLAS_URL || '',
  },
}
