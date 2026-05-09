import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as relatorioService from '../services/relatorioService.js'

type FiltrosRelatorio = {
    usuarioId?: number
    dataInicio?: string
    dataFim?: string
}

export async function resumo(req: Request, res: Response): Promise<void> {
    const { perfil, id } = req.user!
    const usuarioId = perfil === 'participante' ? id : undefined
    const dados = await relatorioService.resumo(usuarioId)
    res.status(StatusCodes.OK).json(dados)
}

export async function porTipo(req: Request, res: Response): Promise<void> {
    const { perfil, id } = req.user!
    const usuarioId = perfil === 'participante' ? id : undefined
    const dados = await relatorioService.porTipo(usuarioId)
    res.status(StatusCodes.OK).json(dados)
}

export async function ranking(_req: Request, res: Response): Promise<void> {
    const dados = await relatorioService.ranking()
    res.status(StatusCodes.OK).json(dados)
}

export async function exportarCSV(req: Request, res: Response): Promise<void> {
    const { perfil, id } = req.user!
    const { data_inicio, data_fim } = req.query as { data_inicio?: string; data_fim?: string }

    const filtros: FiltrosRelatorio = {}
    if (perfil === 'participante') filtros.usuarioId = id
    if (data_inicio) filtros.dataInicio = data_inicio
    if (data_fim) filtros.dataFim = data_fim

    const csv = await relatorioService.exportarCSV(filtros)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio.csv"')
    res.status(StatusCodes.OK).send(csv)
}
