import { log } from "console";
import Session from "../session/sessionModel.js";

//Session Middleware

export const sessionMiddleware= async (req,res,next)=>{
    try {
        
        if(req.method==="OPTIONS"){
            return next();
        }
        // console.log(req.cookies);
        const sid = req.cookies?.sid;
        // console.log(sid);
        if(!sid){
            req.session=null;
            return next();
        }
        
        const session = await Session.findOne({ sid });
        // console.log(session);
 
        if(!session ){
            res.clearCookie("sid");
            req.session=null;   
            return next();
        }

        if(session.expiresAt && session.expiresAt < new Date()){
            await Session.deleteOne({ sid });
            res.clearCookie("sid");
            req.session=null;   
            return res.status(440).json({ message: "Session Expired" });
        }
    
        req.session = session;
        next();
    } catch (error) {
        console.error("Session Middleware Error:", error);
        next(error);
    }
}