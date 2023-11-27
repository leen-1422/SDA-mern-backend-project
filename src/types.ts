export type DecodedUser = {
    userId: string
    email: string
    role: Role
    iat: number
    exp: number
  }
  
  export type Role = 'USER' | 'ADMIN'