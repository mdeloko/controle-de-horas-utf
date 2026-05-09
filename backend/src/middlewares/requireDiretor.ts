import { type Request, type Response, type NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'

export default function requireDiretor(req: Request, res: Response, next: NextFunction): void {
    if (req.user?.perfil !== 'diretor') {
        res.status(StatusCodes.FORBIDDEN).json({ erro: 'Acesso restrito a diretores' })
        return
    }
    next()
}
