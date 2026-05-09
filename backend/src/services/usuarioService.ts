import bcrypt from 'bcrypt'
import { Usuario } from '../models/relations.js'

type UsuarioDados = {
    id: number
    nome: string
    email: string
    perfil: 'diretor' | 'participante'
    ativo: boolean
}

export async function listar() {
    const usuarios = await Usuario.findAll({
        attributes: ['id', 'nome', 'email', 'perfil', 'ativo'],
    })
    return usuarios.map(u => u.get({ plain: true }) as UsuarioDados)
}

export async function buscarPorId(id: number) {
    const usuario = await Usuario.findByPk(id, {
        attributes: ['id', 'nome', 'email', 'perfil', 'ativo'],
    })
    if (!usuario) throw new Error('Usuário não encontrado')
    return usuario.get({ plain: true }) as UsuarioDados
}

export async function criar(dados: { nome: string; email: string; perfil: 'diretor' | 'participante' }) {
    const senhaTemporaria = Math.random().toString(36).slice(-8)
    const senha_hash = await bcrypt.hash(senhaTemporaria, 12)
    const usuario = await Usuario.create({ ...dados, senha_hash })
    const criado = usuario.get({ plain: true }) as UsuarioDados
    return { ...criado, senha_temporaria: senhaTemporaria }
}

export async function editar(id: number, dados: Partial<{ nome: string; perfil: 'diretor' | 'participante'; ativo: boolean }>) {
    const usuario = await Usuario.findByPk(id)
    if (!usuario) throw new Error('Usuário não encontrado')
    await usuario.update(dados)
    return usuario.get({ plain: true }) as UsuarioDados
}

export async function resetarSenha(id: number) {
    const usuario = await Usuario.findByPk(id)
    if (!usuario) throw new Error('Usuário não encontrado')
    const senhaTemporaria = Math.random().toString(36).slice(-8)
    const senha_hash = await bcrypt.hash(senhaTemporaria, 12)
    await usuario.update({ senha_hash })
    return { senha_temporaria: senhaTemporaria }
}
