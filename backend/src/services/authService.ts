import bcrypt from 'bcrypt'
import { Usuario } from '../models/relations.js'
import { assinarToken } from '../utils/jwt.js'

type UsuarioDados = {
    id: number
    nome: string
    email: string
    senha_hash: string
    perfil: 'diretor' | 'participante'
}

export async function login(email: string, senha: string) {
    const usuario = await Usuario.findOne({ where: { email, ativo: true } })
    if (!usuario) throw new Error('Credenciais inválidas')

    const dados = usuario.get({ plain: true }) as UsuarioDados

    const senhaCorreta = await bcrypt.compare(senha, dados.senha_hash)
    if (!senhaCorreta) throw new Error('Credenciais inválidas')

    const token = assinarToken({ id: dados.id, perfil: dados.perfil })
    return {
        token,
        usuario: { id: dados.id, nome: dados.nome, email: dados.email, perfil: dados.perfil },
    }
}
