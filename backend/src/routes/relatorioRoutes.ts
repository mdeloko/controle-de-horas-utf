import { Router } from 'express'
import requireDiretor from '../middlewares/requireDiretor.js'
import * as relatorioController from '../controllers/relatorioController.js'

const relatorioRouter = Router()

relatorioRouter.get('/ranking', requireDiretor, relatorioController.ranking)
relatorioRouter.get('/exportar.csv', relatorioController.exportarCSV)

export default relatorioRouter
