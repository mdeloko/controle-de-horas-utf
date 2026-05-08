import db from "../database/database.js";
import {DataTypes} from "sequelize"

const Usuario = db.define('usuario', {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	nome: { type: DataTypes.STRING(150), allowNull: false },
	email: {
		type: DataTypes.STRING(255),
		allowNull: false,
		unique: true,
		validate: { isEmail: true },
	},
	senha_hash: { type: DataTypes.STRING(255), allowNull: false },
	perfil: {
		type: DataTypes.ENUM('diretor', 'participante'),
		allowNull: false,
		defaultValue: 'participante',
	},
	ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
})


export default Usuario;