import { type Request, type Response, type NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'

export default function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    console.error(err.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erro: 'Erro interno no servidor' })
}
