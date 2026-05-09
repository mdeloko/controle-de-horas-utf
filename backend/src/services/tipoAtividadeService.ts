import { TipoAtividade } from '../models/relations.js'

type TipoDados = {
    id: number
    nome: string
    ativo: boolean
}

export async function listar() {
    const tipos = await TipoAtividade.findAll({ where: { ativo: true } })
    return tipos.map(t => t.get({ plain: true }) as TipoDados)
}

export async function criar(nome: string) {
    const existente = await TipoAtividade.findOne({ where: { nome } })
    if (existente) throw new Error('Já existe um tipo de atividade com esse nome')
    const tipo = await TipoAtividade.create({ nome })
    return tipo.get({ plain: true }) as TipoDados
}

export async function editar(id: number, nome: string) {
    const tipo = await TipoAtividade.findByPk(id)
    if (!tipo) throw new Error('Tipo de atividade não encontrado')
    await tipo.update({ nome })
    return tipo.get({ plain: true }) as TipoDados
}

export async function remover(id: number) {
    const tipo = await TipoAtividade.findByPk(id)
    if (!tipo) throw new Error('Tipo de atividade não encontrado')
    await tipo.update({ ativo: false })
}
