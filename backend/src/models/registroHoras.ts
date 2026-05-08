import db from '../database/database.js'
import { DataTypes } from 'sequelize'


const RegistroHoras = db.define('registro_horas', {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	usuario_id: { type: DataTypes.INTEGER, allowNull: false },
	tipo_atividade_id: { type: DataTypes.INTEGER, allowNull: false },
	data_atividade: { type: DataTypes.DATEONLY, allowNull: false },
	horas: {
		type: DataTypes.DECIMAL(5, 2),
		allowNull: false,
		validate: { min: 0.5, max: 24 },
	},
	descricao: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
	status: {
		type: DataTypes.ENUM('pendente', 'aprovado'),
		allowNull: false,
		defaultValue: 'pendente',
	},
})

export default RegistroHoras;