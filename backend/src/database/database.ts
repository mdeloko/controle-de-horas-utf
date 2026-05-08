import { Sequelize } from 'sequelize'
import path from 'node:path'

const dirname = import.meta.dirname

const db = new Sequelize({
	dialect: 'sqlite',
	storage: path.resolve(dirname, './data/meninas_digitais.sqlite'),
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
	define: {
		timestamps: true,
		underscored: true,
		freezeTableName: true,
	},
})

export default db;
