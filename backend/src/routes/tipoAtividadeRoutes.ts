import { Router } from 'express'
import requireDiretor from '../middlewares/requireDiretor.js'
import * as tipoAtividadeController from '../controllers/tipoAtividadeController.js'

const tipoAtividadeRouter = Router()

tipoAtividadeRouter.get('/', tipoAtividadeController.listar)
tipoAtividadeRouter.post('/', requireDiretor, tipoAtividadeController.criar)
tipoAtividadeRouter.patch('/:id', requireDiretor, tipoAtividadeController.editar)
tipoAtividadeRouter.delete('/:id', requireDiretor, tipoAtividadeController.remover)

export default tipoAtividadeRouter
