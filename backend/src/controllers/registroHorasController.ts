import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as registroHorasService from '../services/registroHorasService.js'

type FiltrosRegistroHoras = {
    usuarioId?: number
    tipoAtividadeId?: number
    status?: 'pendente' | 'aprovado'
    dataInicio?: string
    dataFim?: string
}

type DadosEdicaoRegistroHoras = {
    tipo_atividade_id?: number
    data_atividade?: string
    horas?: number
    descricao?: string
    aprovar?: boolean
}

export async function criar(req: Request, res: Response): Promise<void> {
    const { tipo_atividade_id, data_atividade, horas, descricao } = req.body as {
        tipo_atividade_id?: number
        data_atividade?: string
        horas?: number
        descricao?: string
    }
    if (!tipo_atividade_id || !data_atividade || !horas) {
        res.status(StatusCodes.BAD_REQUEST).json({ erro: 'Tipo de atividade, data e horas são obrigatórios' })
        return
    }
    const registro = await registroHorasService.criar({
        usuario_id: req.user!.id,
        tipo_atividade_id,
        data_atividade,
        horas,
        ...(descricao !== undefined && { descricao }),
    })
    res.status(StatusCodes.CREATED).json(registro)
}

export async function atribuir(req: Request, res: Response): Promise<void> {
    const { usuario_id, tipo_atividade_id, data_atividade, horas, descricao } = req.body as {
        usuario_id?: number
        tipo_atividade_id?: number
        data_atividade?: string
        horas?: number
        descricao?: string
    }
    if (!usuario_id || !tipo_atividade_id || !data_atividade || !horas) {
        res.status(StatusCodes.BAD_REQUEST).json({ erro: 'Participante, tipo de atividade, data e horas são obrigatórios' })
        return
    }
    const registro = await registroHorasService.atribuir({
        usuario_id,
        tipo_atividade_id,
        data_atividade,
        horas,
        ...(descricao !== undefined && { descricao }),
    })
    res.status(StatusCodes.CREATED).json(registro)
}

export async function listar(req: Request, res: Response): Promise<void> {
    const { perfil, id } = req.user!
    const { usuario_id, tipo_atividade_id, status, data_inicio, data_fim } = req.query as {
        usuario_id?: string
        tipo_atividade_id?: string
        status?: string
        data_inicio?: string
        data_fim?: string
    }

    const filtros: FiltrosRegistroHoras = {}
    if (perfil === 'participante') {
        filtros.usuarioId = id
    } else if (usuario_id) {
        filtros.usuarioId = parseInt(usuario_id)
    }
    if (tipo_atividade_id) filtros.tipoAtividadeId = parseInt(tipo_atividade_id)
    if (status === 'pendente' || status === 'aprovado') filtros.status = status
    if (data_inicio) filtros.dataInicio = data_inicio
    if (data_fim) filtros.dataFim = data_fim

    const registros = await registroHorasService.listar(filtros)
    res.status(StatusCodes.OK).json(registros)
}

export async function aprovar(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params['id'] as string)
    try {
        const registro = await registroHorasService.aprovar(id)
        res.status(StatusCodes.OK).json(registro)
    } catch (err) {
        res.status(StatusCodes.NOT_FOUND).json({ erro: (err as Error).message })
    }
}

export async function editar(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params['id'] as string)
    try {
        const registro = await registroHorasService.editar(id, req.body as DadosEdicaoRegistroHoras)
        res.status(StatusCodes.OK).json(registro)
    } catch (err) {
        res.status(StatusCodes.NOT_FOUND).json({ erro: (err as Error).message })
    }
}
