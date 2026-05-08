import Usuario from "./usuario.js"
import TipoAtividade from "./tipoAtividade.js"
import RegistroHoras from "./registroHoras.js"

Usuario.hasMany(RegistroHoras, { foreignKey: 'usuario_id', as: 'registros' })
RegistroHoras.belongsTo(Usuario, {
	foreignKey: 'usuario_id',
	as: 'participante',
})

TipoAtividade.hasMany(RegistroHoras, {
	foreignKey: 'tipo_atividade_id',
	as: 'registros',
})
RegistroHoras.belongsTo(TipoAtividade, {
	foreignKey: 'tipo_atividade_id',
	as: 'tipoAtividade',
})

export {Usuario,TipoAtividade,RegistroHoras}