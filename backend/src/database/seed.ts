import bcrypt from 'bcrypt'
import db from "./database.js"
import {Usuario,TipoAtividade} from "../models/relations.js"

export default async function seed() {
	try {
		await db.sync({ force: false })
		console.log('Banco sincronizado.')

		const tipos = [
			'Reunião',
			'Permanência',
			'Evento',
			'Oficina',
			'Mentoria',
		]
		for (const nome of tipos) {
			await TipoAtividade.findOrCreate({ where: { nome } })
		}
		console.log('Tipos de atividade criados.')

		const senhaDir = await bcrypt.hash('Diretor@123', 12)
		await Usuario.findOrCreate({
			where: { email: 'diretor@meninasdigitais.utfpr.br' },
			defaults: {
				nome: 'Coordenador Geral',
				email: 'diretor@meninasdigitais.utfpr.br',
				senha_hash: senhaDir,
				perfil: 'diretor',
			},
		})
		console.log(
			'Diretor criado  →  diretor@meninasdigitais.utfpr.br  /  Diretor@123',
		)

		const senhaPart = await bcrypt.hash('Participante@123', 12)
		await Usuario.findOrCreate({
			where: { email: 'participante@meninasdigitais.utfpr.br' },
			defaults: {
				nome: 'Participante Exemplo',
				email: 'participante@meninasdigitais.utfpr.br',
				senha_hash: senhaPart,
				perfil: 'participante',
			},
		})
		console.log(
			'Participante criado  →  participante@meninasdigitais.utfpr.br  /  Participante@123',
		)

		console.log('\nSeed concluído!')
		process.exit(0)
	} catch (error) {
		console.error('Erro no seed:', error)
		process.exit(1)
	}
}
