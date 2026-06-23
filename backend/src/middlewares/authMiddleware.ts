import { type Request, type Response, type NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { verificarToken, type JwtPayload } from '../utils/jwt.js'
import { Usuario } from '../models/relations.js'

// augmentação global — disponibiliza req.user em todo o projeto
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export default async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Token não fornecido' })
        return
    }
    const token = authHeader.slice(7)
    try {
		const { id } = verificarToken(token)
		const usuario = await Usuario.findByPk(id, {
			attributes: ['id', 'perfil', 'ativo'],
		})
		if (!usuario) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				erro: 'Token inválido ou expirado',
			})
			return
		}
		const dados = usuario.get({ plain: true }) as {
			id: number
			perfil: 'diretor' | 'participante'
			ativo: boolean
		}
		if (!dados.ativo) {
			res.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Conta inativa' })
			return
		}
		req.user = { id: dados.id, perfil: dados.perfil }
		next()
	} catch {
		res.status(StatusCodes.UNAUTHORIZED).json({
			erro: 'Token inválido ou expirado',
		})
	}
}
