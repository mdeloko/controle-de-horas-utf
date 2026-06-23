import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as relatorioService from '../services/relatorioService.js'

type FiltrosRelatorio = {
    usuarioId?: number
    dataInicio?: string
    dataFim?: string
}

export async function ranking(_req: Request, res: Response): Promise<void> {
    const dados = await relatorioService.ranking()
    res.status(StatusCodes.OK).json(dados)
}

export async function exportarCSV(req: Request, res: Response): Promise<void> {
    const { perfil, id } = req.user!
    const { usuario_id, data_inicio, data_fim } = req.query as { usuario_id?: string; data_inicio?: string; data_fim?: string }

    const filtros: FiltrosRelatorio = {}
    if (perfil === 'participante') {
        filtros.usuarioId = id
    } else if (usuario_id) {
        filtros.usuarioId = parseInt(usuario_id)
    }
    if (data_inicio) filtros.dataInicio = data_inicio
    if (data_fim) filtros.dataFim = data_fim

    const csv = await relatorioService.exportarCSV(filtros)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio.csv"')
    res.status(StatusCodes.OK).send(csv)
}
