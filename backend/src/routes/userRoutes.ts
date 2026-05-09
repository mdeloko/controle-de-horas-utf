import { Router,type Request, type Response } from "express";
import * as usuarioController from '../controllers/usuarioController.js'
import requireDiretor from '../middlewares/requireDiretor.js'


const userRouter = Router();

userRouter.get('/me', usuarioController.buscarMe)
userRouter.get('/', requireDiretor, usuarioController.listar)
userRouter.post('/', requireDiretor, usuarioController.criar)
userRouter.patch('/:id', requireDiretor, usuarioController.editar)
userRouter.post(
	'/:id/reset-senha',
	requireDiretor,
	usuarioController.resetarSenha,
)

export default userRouter