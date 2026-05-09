import { Op } from 'sequelize'
import { RegistroHoras, Usuario, TipoAtividade } from '../models/relations.js'

type FiltrosRelatorio = {
    usuarioId?: number
    dataInicio?: string
    dataFim?: string
}

type ParticipanteRelatorio = {
    id: number
    nome: string
    email: string
}

type TipoRelatorio = {
    id: number
    nome: string
}

type RegistroResumo = {
    usuario_id: number
    horas: number
    participante: ParticipanteRelatorio
}

type RegistroPorTipo = {
    tipo_atividade_id: number
    horas: number
    tipoAtividade: TipoRelatorio
}

type RegistroCSV = {
    id: number
    data_atividade: string
    horas: number
    descricao?: string
    participante: {
        nome: string
        email: string
    }
    tipoAtividade: {
        nome: string
    }
}

export async function resumo(usuarioId?: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: 'aprovado' }
    if (usuarioId) where['usuario_id'] = usuarioId

    const registros = await RegistroHoras.findAll({
        where,
        include: [
            { model: Usuario, as: 'participante', attributes: ['id', 'nome', 'email'] },
        ],
    })

    const plain = registros.map(r => r.get({ plain: true }) as RegistroResumo)

    const porUsuario = new Map<number, { usuario: ParticipanteRelatorio; total_horas: number }>()
    for (const r of plain) {
        const entry = porUsuario.get(r.usuario_id)
        if (entry) {
            entry.total_horas += r.horas
        } else {
            porUsuario.set(r.usuario_id, { usuario: r.participante, total_horas: r.horas })
        }
    }

    return Array.from(porUsuario.values())
}

export async function porTipo(usuarioId?: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: 'aprovado' }
    if (usuarioId) where['usuario_id'] = usuarioId

    const registros = await RegistroHoras.findAll({
        where,
        include: [
            { model: TipoAtividade, as: 'tipoAtividade', attributes: ['id', 'nome'] },
        ],
    })

    const plain = registros.map(r => r.get({ plain: true }) as RegistroPorTipo)

    const porTipo = new Map<number, { tipo: TipoRelatorio; total_horas: number }>()
    for (const r of plain) {
        const entry = porTipo.get(r.tipo_atividade_id)
        if (entry) {
            entry.total_horas += r.horas
        } else {
            porTipo.set(r.tipo_atividade_id, { tipo: r.tipoAtividade, total_horas: r.horas })
        }
    }

    return Array.from(porTipo.values()).sort((a, b) => b.total_horas - a.total_horas)
}

export async function ranking() {
    const registros = await RegistroHoras.findAll({
        where: { status: 'aprovado' },
        include: [
            { model: Usuario, as: 'participante', attributes: ['id', 'nome', 'email'] },
        ],
    })

    const plain = registros.map(r => r.get({ plain: true }) as RegistroResumo)

    const porUsuario = new Map<number, { usuario: ParticipanteRelatorio; total_horas: number }>()
    for (const r of plain) {
        const entry = porUsuario.get(r.usuario_id)
        if (entry) {
            entry.total_horas += r.horas
        } else {
            porUsuario.set(r.usuario_id, { usuario: r.participante, total_horas: r.horas })
        }
    }

    return Array.from(porUsuario.values())
        .sort((a, b) => b.total_horas - a.total_horas)
        .map((entry, index) => ({ posicao: index + 1, ...entry }))
}

export async function exportarCSV(filtros: FiltrosRelatorio) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: 'aprovado' }
    if (filtros.usuarioId) where['usuario_id'] = filtros.usuarioId
    if (filtros.dataInicio || filtros.dataFim) {
        where['data_atividade'] = {
            ...(filtros.dataInicio ? { [Op.gte]: filtros.dataInicio } : {}),
            ...(filtros.dataFim ? { [Op.lte]: filtros.dataFim } : {}),
        }
    }

    const registros = await RegistroHoras.findAll({
        where,
        include: [
            { model: Usuario, as: 'participante', attributes: ['id', 'nome', 'email'] },
            { model: TipoAtividade, as: 'tipoAtividade', attributes: ['id', 'nome'] },
        ],
        order: [['data_atividade', 'ASC']],
    })

    const plain = registros.map(r => r.get({ plain: true }) as RegistroCSV)

    const linhas = [
        'id,participante,email,tipo_atividade,data,horas,descricao',
        ...plain.map(r =>
            [
                r.id,
                `"${r.participante.nome}"`,
                r.participante.email,
                `"${r.tipoAtividade.nome}"`,
                r.data_atividade,
                r.horas,
                `"${r.descricao ?? ''}"`,
            ].join(',')
        ),
    ]

    return linhas.join('\n')
}
