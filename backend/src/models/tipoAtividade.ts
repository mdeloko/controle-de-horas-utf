import db from "../database/database.js"
import { DataTypes } from 'sequelize'

const TipoAtividade = db.define('tipo_atividade', {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	nome: { type: DataTypes.STRING(100), allowNull: false, unique: true },
	ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
})


export default TipoAtividade;