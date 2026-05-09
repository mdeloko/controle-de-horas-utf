import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as tipoAtividadeService from '../services/tipoAtividadeService.js'

export async function listar(_req: Request, res: Response): Promise<void> {
    const tipos = await tipoAtividadeService.listar()
    res.status(StatusCodes.OK).json(tipos)
}

export async function criar(req: Request, res: Response): Promise<void> {
    const { nome } = req.body as { nome?: string }
    if (!nome) {
        res.status(StatusCodes.BAD_REQUEST).json({ erro: 'Nome é obrigatório' })
        return
    }
    try {
        const tipo = await tipoAtividadeService.criar(nome)
        res.status(StatusCodes.CREATED).json(tipo)
    } catch (err) {
        res.status(StatusCodes.CONFLICT).json({ erro: (err as Error).message })
    }
}

export async function editar(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params['id'] as string)
    const { nome } = req.body as { nome?: string }
    if (!nome) {
        res.status(StatusCodes.BAD_REQUEST).json({ erro: 'Nome é obrigatório' })
        return
    }
    try {
        const tipo = await tipoAtividadeService.editar(id, nome)
        res.status(StatusCodes.OK).json(tipo)
    } catch (err) {
        res.status(StatusCodes.NOT_FOUND).json({ erro: (err as Error).message })
    }
}

export async function remover(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params['id'] as string)
    try {
        await tipoAtividadeService.remover(id)
        res.status(StatusCodes.NO_CONTENT).send()
    } catch (err) {
        res.status(StatusCodes.NOT_FOUND).json({ erro: (err as Error).message })
    }
}
