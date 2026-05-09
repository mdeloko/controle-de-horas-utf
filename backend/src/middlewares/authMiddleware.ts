import { type Request, type Response, type NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { verificarToken, type JwtPayload } from '../utils/jwt.js'

// augmentação global — disponibiliza req.user em todo o projeto
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export default function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Token não fornecido' })
        return
    }
    const token = authHeader.slice(7)
    try {
        req.user = verificarToken(token)
        next()
    } catch {
        res.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Token inválido ou expirado' })
    }
}
