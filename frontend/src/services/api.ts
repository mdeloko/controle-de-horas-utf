const BASE_URL = 'http://localhost:3000'

// ── Backend API shapes ─────────────────────────────────────────────────────

type ApiRegistro = {
  id: number
  usuario_id: number
  tipo_atividade_id: number
  data_atividade: string
  horas: number
  descricao?: string
  status: 'pendente' | 'aprovado'
  participante?: { id: number; nome: string; email: string }
  tipoAtividade?: { id: number; nome: string }
}

type ApiUsuario = {
  id: number
  nome: string
  email: string
  perfil: 'diretor' | 'participante'
  ativo: boolean
}

// ── Public types (consumed by components) ─────────────────────────────────

export type TipoAtividade = { id: number; nome: string }

export type Registro = {
  id: string
  participantId: string
  participantName: string
  type: string
  date: string
  hours: number
  description: string
  status: 'Aprovada' | 'Pendente'
}

export type Usuario = {
  id: number
  name: string
  email: string
  role: 'Diretor' | 'Participante'
}

export type RankingEntry = {
  posicao: number
  total_horas: number
  usuario: { id: number; nome: string; email: string }
}

export type AuthUser = {
  id: number
  name: string
  email: string
  role: 'Diretor' | 'Participante'
  initials: string
}

// ── HTTP helper ────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem('md_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) ?? {}),
    },
  })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((body as { erro?: string }).erro ?? `Erro ${res.status}`)
  return body as T
}

// ── Transforms ────────────────────────────────────────────────────────────

function toRegistro(r: ApiRegistro): Registro {
  return {
    id: String(r.id),
    participantId: String(r.usuario_id),
    participantName: r.participante?.nome ?? '',
    type: r.tipoAtividade?.nome ?? '',
    date: r.data_atividade,
    hours: r.horas,
    description: r.descricao ?? '',
    status: r.status === 'aprovado' ? 'Aprovada' : 'Pendente',
  }
}

function toUsuario(u: ApiUsuario): Usuario {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    role: u.perfil === 'diretor' ? 'Diretor' : 'Participante',
  }
}

function makeInitials(nome: string): string {
  return nome
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function loginApi(
  email: string,
  senha: string,
): Promise<{ token: string; user: AuthUser }> {
  const data = await request<{ token: string; usuario: ApiUsuario }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
  localStorage.setItem('md_token', data.token)
  const u = data.usuario
  return {
    token: data.token,
    user: {
      id: u.id,
      name: u.nome,
      email: u.email,
      role: u.perfil === 'diretor' ? 'Diretor' : 'Participante',
      initials: makeInitials(u.nome),
    },
  }
}

export function logoutApi(): void {
  localStorage.removeItem('md_token')
}

// ── Tipos de Atividade ────────────────────────────────────────────────────

export async function getTipos(): Promise<TipoAtividade[]> {
  return request<TipoAtividade[]>('/tipos-atividade')
}

export async function createTipo(nome: string): Promise<TipoAtividade> {
  return request<TipoAtividade>('/tipos-atividade', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  })
}

export async function editTipo(id: number, nome: string): Promise<TipoAtividade> {
  return request<TipoAtividade>(`/tipos-atividade/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ nome }),
  })
}

export async function deleteTipo(id: number): Promise<void> {
  return request<void>(`/tipos-atividade/${id}`, { method: 'DELETE' })
}

// ── Registros de Horas ────────────────────────────────────────────────────

export type FiltrosRegistro = {
  usuario_id?: number
  tipo_atividade_id?: number
  status?: 'pendente' | 'aprovado'
  data_inicio?: string
  data_fim?: string
}

export async function getRegistros(filtros: FiltrosRegistro = {}): Promise<Registro[]> {
  const params = new URLSearchParams()
  if (filtros.usuario_id) params.set('usuario_id', String(filtros.usuario_id))
  if (filtros.tipo_atividade_id) params.set('tipo_atividade_id', String(filtros.tipo_atividade_id))
  if (filtros.status) params.set('status', filtros.status)
  if (filtros.data_inicio) params.set('data_inicio', filtros.data_inicio)
  if (filtros.data_fim) params.set('data_fim', filtros.data_fim)
  const qs = params.toString() ? `?${params.toString()}` : ''
  const data = await request<ApiRegistro[]>(`/registros${qs}`)
  return data.map(toRegistro)
}

export async function createRegistro(dados: {
  tipo_atividade_id: number
  data_atividade: string
  horas: number
  descricao?: string
}): Promise<Registro> {
  const data = await request<ApiRegistro>('/registros', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
  return toRegistro(data)
}

export async function atribuirRegistro(dados: {
  usuario_id: number
  tipo_atividade_id: number
  data_atividade: string
  horas: number
  descricao?: string
}): Promise<Registro> {
  const data = await request<ApiRegistro>('/registros/atribuir', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
  return toRegistro(data)
}

export async function aprovarRegistro(id: string): Promise<void> {
  await request<ApiRegistro>(`/registros/${id}/aprovar`, { method: 'PATCH' })
}

export async function editarRegistro(
  id: string,
  dados: {
    tipo_atividade_id?: number
    data_atividade?: string
    horas?: number
    descricao?: string
    aprovar?: boolean
  },
): Promise<void> {
  await request<ApiRegistro>(`/registros/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  })
}

// ── Usuários ──────────────────────────────────────────────────────────────

export async function getUsuarios(): Promise<Usuario[]> {
  const data = await request<ApiUsuario[]>('/user')
  return data.map(toUsuario)
}

export async function createUsuario(dados: {
  nome: string
  email: string
  perfil: 'diretor' | 'participante'
}): Promise<Usuario> {
  const data = await request<ApiUsuario>('/user', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
  return toUsuario(data)
}

export async function resetarSenha(id: number): Promise<void> {
  await request<void>(`/user/${id}/reset-senha`, { method: 'POST' })
}

// ── Relatórios ────────────────────────────────────────────────────────────

export async function getRanking(): Promise<RankingEntry[]> {
  return request<RankingEntry[]>('/relatorios/ranking')
}

export async function exportarCSV(params: {
  data_inicio?: string
  data_fim?: string
} = {}): Promise<void> {
  const token = getToken()
  const qs = new URLSearchParams()
  if (params.data_inicio) qs.set('data_inicio', params.data_inicio)
  if (params.data_fim) qs.set('data_fim', params.data_fim)
  const url = `${BASE_URL}/relatorios/exportar.csv${qs.toString() ? `?${qs.toString()}` : ''}`
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Erro ao exportar CSV')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'relatorio.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}
