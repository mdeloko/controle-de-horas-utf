import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as usuarioService from '../services/usuarioService.js'

export async function listar(_req: Request, res: Response): Promise<void> {
    const usuarios = await usuarioService.listar()
    res.status(StatusCodes.OK).json(usuarios)
}

export async function buscarMe(req: Request, res: Response): Promise<void> {
    const usuario = await usuarioService.buscarPorId(req.user!.id)
    res.status(StatusCodes.OK).json(usuario)
}

export async function criar(req: Request, res: Response): Promise<void> {
    const { nome, email, perfil } = req.body as { nome?: string; email?: string; perfil?: string }
    if (!nome || !email) {
        res.status(StatusCodes.BAD_REQUEST).json({ erro: 'Nome e e-mail são obrigatórios' })
        return
    }
    try {
        const perfilValido: 'diretor' | 'participante' = perfil === 'diretor' ? 'diretor' : 'participante'
        const resultado = await usuarioService.criar({ nome, email, perfil: perfilValido })
        res.status(StatusCodes.CREATED).json(resultado)
    } catch (err) {
        res.status(StatusCodes.CONFLICT).json({ erro: (err as Error).message })
    }
}

export async function editar(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params['id'] as string)
    try {
        const resultado = await usuarioService.editar(id, req.body as Partial<{ nome: string; perfil: 'diretor' | 'participante'; ativo: boolean }>)
        res.status(StatusCodes.OK).json(resultado)
    } catch (err) {
        res.status(StatusCodes.NOT_FOUND).json({ erro: (err as Error).message })
    }
}

export async function resetarSenha(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params['id'] as string)
    try {
        const resultado = await usuarioService.resetarSenha(id)
        res.status(StatusCodes.OK).json(resultado)
    } catch (err) {
        res.status(StatusCodes.NOT_FOUND).json({ erro: (err as Error).message })
    }
}
