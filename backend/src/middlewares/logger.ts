import { type Request, type Response, type NextFunction } from "express";

export default function logger(req:Request, res:Response, next:NextFunction){
    const dateTime = new Date().toLocaleDateString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const reqStartTime = Date.now();
    res.on("finish",()=>{
        const reqEndTime = Date.now() - reqStartTime;
        const {method,url,hostname,ip} = req;
        const {statusCode} = res;
        console.log(
            dateTime,
            "| Requisição",
            "["+method+"]",
            "em:",
            url,
            reqEndTime+"ms",
            "De:",
            hostname+" <> "+ip,
            "Status:", statusCode
        );
    });
    next();
}
