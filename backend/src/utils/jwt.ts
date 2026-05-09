import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET ?? 'dev_secret'

export interface JwtPayload {
    id: number
    perfil: 'diretor' | 'participante'
}

export function assinarToken(payload: JwtPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

export function verificarToken(token: string): JwtPayload {
    return jwt.verify(token, SECRET) as JwtPayload
}
