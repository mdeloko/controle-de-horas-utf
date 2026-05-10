import express from  "express";
import cors from "cors";
import fs from "fs";
import seed from "./database/seed.js";
import db, { databasePath } from "./database/database.js";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import errorHandler from "./middlewares/errorHandler.js";
import tipoAtividadeRouter from "./routes/tipoAtividadeRoutes.js";
import registroHorasRouter from "./routes/registroHorasRoutes.js";
import relatorioRouter from "./routes/relatorioRoutes.js";
import logger from "./middlewares/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

const dbExists = fs.existsSync(databasePath);
if(!dbExists){
    await seed();
}else{
    await db.sync({force:false,logging:false});
}

process.env.NODE_ENV === 'development' && app.use(logger);
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// rotas públicas
app.use('/auth', authRouter);

app.get("/ping",(_,res)=>{
    const data:string = new Date().toLocaleDateString("pt-BR",{hour:"numeric",minute:"numeric",second:"numeric"})
    res.json({msg:"Pong!",time:data}).status(200)
})

app.use(authMiddleware);

// rotas protegidas
app.use('/user', userRouter);
app.use('/tipos-atividade', tipoAtividadeRouter);
app.use('/registros', registroHorasRouter);
app.use('/relatorios', relatorioRouter);

app.use(errorHandler);

app.listen(PORT,() => console.log('🚀 Servidor funcionando na porta', PORT));