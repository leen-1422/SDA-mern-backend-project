import { NextFunction, Request, Response } from 'express'
// import ApiError from '../errors/ApiError'

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
//   if (err instanceof ApiError) {
//     res.status(err.code).json({ msg: err.message })
//     return
//   }

//   res.status(500).json({ msg: 'Something went wrong.' })
// }
console.log(error)
res.status(500).json({
  message: error.message,
});

};