declare namespace Express {
  interface Request {
    validateUser: {
      email: string
      password: string
      firstName: string
      lastName: string
      // orderId:string
    }
    decodedUser: {
      userId: string
      email: string
      role: 'USER' | 'ADMIN'
      iat: number
      exp: number
    }
    validatedLoginUser: {
      email: string
      password: string
    }
    forgotPassUser:{
      email:string
    }
    resetPassUser:{
      password:string
      forgotPasswordCode:string
    }
  }
}
