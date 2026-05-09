import { Op } from 'sequelize'
import { RegistroHoras, Usuario, TipoAtividade } from '../models/relations.js'

type FiltrosListagem = {
    usuarioId?: number
    tipoAtividadeId?: number
    status?: 'pendente' | 'aprovado'
    dataInicio?: string
    dataFim?: string
}

type DadosCriacao = {
    usuario_id: number
    tipo_atividade_id: number
    data_atividade: string
    horas: number
    descricao?: string
}

type DadosEdicao = {
    tipo_atividade_id?: number
    data_atividade?: string
    horas?: number
    descricao?: string
    aprovar?: boolean
}

export async function criar(dados: DadosCriacao) {
    const registro = await RegistroHoras.create({ ...dados, status: 'pendente' })
    return registro.get({ plain: true })
}

export async function atribuir(dados: DadosCriacao) {
    const registro = await RegistroHoras.create({ ...dados, status: 'aprovado' })
    return registro.get({ plain: true })
}

export async function listar(filtros: FiltrosListagem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (filtros.usuarioId) where['usuario_id'] = filtros.usuarioId
    if (filtros.tipoAtividadeId) where['tipo_atividade_id'] = filtros.tipoAtividadeId
    if (filtros.status) where['status'] = filtros.status
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
        order: [['data_atividade', 'DESC']],
    })
    return registros.map(r => r.get({ plain: true }))
}

export async function aprovar(id: number) {
    const registro = await RegistroHoras.findByPk(id)
    if (!registro) throw new Error('Registro não encontrado')
    await registro.update({ status: 'aprovado' })
    return registro.get({ plain: true })
}

export async function editar(id: number, dados: DadosEdicao) {
    const registro = await RegistroHoras.findByPk(id)
    if (!registro) throw new Error('Registro não encontrado')

    const { aprovar: deveAprovar, ...campos } = dados
    await registro.update({
        ...campos,
        ...(deveAprovar ? { status: 'aprovado' } : {}),
    })
    return registro.get({ plain: true })
}
