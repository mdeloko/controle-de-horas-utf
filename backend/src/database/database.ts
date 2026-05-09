import { Sequelize } from 'sequelize'
import fs from 'node:fs'
import path from 'node:path'

const dirname = import.meta.dirname
export const databaseDir = path.resolve(dirname, './data')
export const databasePath = path.join(databaseDir, 'meninas_digitais.sqlite')

fs.mkdirSync(databaseDir, { recursive: true })

const db = new Sequelize({
	dialect: 'sqlite',
	storage: databasePath,
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
	define: {
		timestamps: true,
		underscored: true,
		freezeTableName: true,
	},
})

export default db;
