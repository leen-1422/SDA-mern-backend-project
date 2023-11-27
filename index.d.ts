
declare namespace Express {
  interface Request {
    validateUser: {
    email: string
    password: string
  }
  decodedUser: {
    userId: string
    email: string
    role: 'USER' | 'ADMIN'
    iat: number
    exp: number
  }}
}
