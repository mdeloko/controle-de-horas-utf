import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as authService from '../services/authService.js'

export async function login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body as { email?: string; senha?: string }
    if (!email || !senha) {
        res.status(StatusCodes.BAD_REQUEST).json({ erro: 'E-mail e senha são obrigatórios' })
        return
    }
    try {
        const resultado = await authService.login(email, senha)
        res.status(StatusCodes.OK).json(resultado)
    } catch {
        res.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Credenciais inválidas' })
    }
}

export function logout(_req: Request, res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send()
}
