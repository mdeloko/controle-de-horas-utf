import express from  "express";
import fs from "fs";
import seed from "./database/seed.js";
import db from "./database/database.js";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import tipoAtividadeRouter from "./routes/tipoAtividadeRoutes.js";
import logger from "./middlewares/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

const pathExists = fs.existsSync(import.meta.dirname+"/database/data");
if(!pathExists){
    await seed();
}else{
    await db.sync({force:false,logging:false});
}

process.env.NODE_ENV === 'development' && app.use(logger);
app.use(express.json());

app.use('/tipos-atividade', tipoAtividadeRouter);

// rotas públicas
app.use('/auth', authRouter);

app.get("/ping",(_,res)=>{
    const data:string = new Date().toLocaleDateString("pt-BR",{hour:"numeric",minute:"numeric",second:"numeric"})
    res.json({msg:"Pong!",time:data}).status(200)
})

app.use(authMiddleware);

// rotas protegidas
app.use('/user', userRouter);

app.listen(PORT,() => console.log('🚀 Servidor funcionando na porta', PORT));