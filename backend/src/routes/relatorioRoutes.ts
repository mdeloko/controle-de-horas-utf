import { Router } from 'express'
import requireDiretor from '../middlewares/requireDiretor.js'
import * as relatorioController from '../controllers/relatorioController.js'

const relatorioRouter = Router()

relatorioRouter.get('/resumo', relatorioController.resumo)
relatorioRouter.get('/por-tipo', relatorioController.porTipo)
relatorioRouter.get('/ranking', requireDiretor, relatorioController.ranking)
relatorioRouter.get('/exportar.csv', relatorioController.exportarCSV)

export default relatorioRouter
