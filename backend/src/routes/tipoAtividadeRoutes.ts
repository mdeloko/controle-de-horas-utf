import { Router } from 'express'
import * as tipoAtividadeController from '../controllers/tipoAtividadeController.js'

const tipoAtividadeRouter = Router()

tipoAtividadeRouter.get('/', tipoAtividadeController.listar)
tipoAtividadeRouter.post('/', tipoAtividadeController.criar)
tipoAtividadeRouter.patch('/:id', tipoAtividadeController.editar)
tipoAtividadeRouter.delete('/:id', tipoAtividadeController.remover)

export default tipoAtividadeRouter
