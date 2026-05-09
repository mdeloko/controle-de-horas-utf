import { Router } from 'express'
import requireDiretor from '../middlewares/requireDiretor.js'
import * as registroHorasController from '../controllers/registroHorasController.js'

const registroHorasRouter = Router()

registroHorasRouter.get('/', registroHorasController.listar)
registroHorasRouter.post('/', registroHorasController.criar)
registroHorasRouter.post('/atribuir', requireDiretor, registroHorasController.atribuir)
registroHorasRouter.patch('/:id/aprovar', requireDiretor, registroHorasController.aprovar)
registroHorasRouter.patch('/:id', requireDiretor, registroHorasController.editar)

export default registroHorasRouter
