
import { json, type Request, type Response } from 'express';
import Caller from '../MTCaller';
import { generateWebImei,savePath,genPassword } from '../utils'; 
import Controller from './Controller';
import SessionManager from './SessionManager';
class AuthController extends Controller{
    
    public sendCode = async (req:Request, resp:Response) =>{
        const {phone} = req.body;
        const imei = generateWebImei();
        let caller:Caller;
        if(!SessionManager.getMe().contains(phone)){
            caller = new Caller();
            caller.setImei(imei);
            SessionManager.getMe().push(phone,caller);
        }else{
            caller = SessionManager.getMe().get(phone);
            caller.setImei(imei);
        }
        try{
            const res = await caller.sendCode(phone);
            if(res._ == "auth.sentCode"){
                resp.send({
                    imei,
                    phone_hash: res.phone_code_hash,
                    next: res.next_type._
                });
            }else{
                this.sendError(res,"error in sending code")
            }
        }catch(e){
            this.sendError(resp,"error in connection");
        }
        
    }

    public login= async (req:Request, resp:Response) =>{
        const {phone,code} = req.body;
        if(SessionManager.getMe().contains(phone)){
            let caller:Caller = SessionManager.getMe().get(phone);
            try{
            const res = await caller.login(phone,code);
            
            if(res._ == "auth.authorization"){
                const token = res.token;
                caller.setToken(token); 
                await Bun.write(savePath+`/${(phone+"").substring(1)}`,`${caller.getImei()} ${token}`) 
                resp.send({
                    token,
                    imei: caller.getImei(),
                    user_id: res.user.id,
                    username: res.user.username,
                    access_hash: res.user.access_hash

                });
            }else{
                if(res._ == "error" && res.text == "SESSION_PASSWORD_NEEDED" ){
                    this.sendError(resp,`PasswordRequired`);
                }else{
                    this.sendError(resp,`Error. phone:${phone} or code: ${code} is wrong`);
                } 
            }
        }catch(e){
            this.sendError(resp,"Error. cannot connect to the eitaa server");
        }
        }else{
            this.sendError(resp,"Error. first yo need to ask for sending code");
        }
    }

    public logout = async (req:Request, resp:Response) =>{
        const {phone} = req.body;
        if(SessionManager.getMe().contains(phone)){
            try{
                let caller:Caller = SessionManager.getMe().get(phone);
                let logout_ = async () =>  await caller.sendLogout();
                let res = await this.callMethod(logout_,resp,phone,caller);
                
                if(res && res._ == "boolTrue"){
                    await Bun.write(savePath+`/${(phone+"").substring(1)}`, ""); 
                    resp.send({
                        result:"ok"
                    });
                }else{
                    this.sendError(resp,`error: cannot logout\n ${res}`)
                }
                
                // if(res._ == ""){

                // }else{
                //     resp.status(400).send({
                //         msg:"Error: cannotlogout"
                //     });
                // }
            }catch(e){
               this.sendError(resp,"Error: cannot connect to the eitaa server for logout");
            }
        }else{
            this.sendError(resp,"You are not logged in");
        }
        
    }

    public loadSession = async (req:Request, resp:Response) =>{
        const {phone} = req.body;
        try{
            const file = Bun.file(savePath+`${(phone+"").substring(1)}`);
            console.log("File: " + savePath+`${(phone+"").substring(1)}`)

            if( await file.exists()){
                const line = await file.text();
                const arr = line.split(" ");
                if(arr.length==2){
                    let caller:Caller;
                    if(SessionManager.getMe().contains(phone)){
                        caller = SessionManager.getMe().get(phone);
                    }else{
                        caller = new Caller()
                    }
                    caller.setImei(arr[0]);
                    caller.setToken(arr[1]);
                    SessionManager.getMe().push(phone,caller);
                    resp.send({
                        result:"ok"
                    })
                }else{
                    this.sendError(resp,"File not exist");
                }
            }
        }catch(e){
            this.sendError(resp,"error: no table to access files in loadSession");
        } 
    }

    public enforceTwoStepVerification = async (req:Request, resp:Response) =>{
        let { phone,   password } = req.body;
        
        if(!password){
            password="123456";
        }
        if (this.checkPhone(resp, phone, "Session does not exist in enforceTwoStepVerification")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const saltGetter = async()=>await caller.getPasswordLayer68();
            let _res = await this.callMethod(saltGetter,resp,phone,caller);
            // console.log(_res);
            if(_res && _res._){
                if(_res._ == "account.noPassword"){
                    const salt = new Uint8Array(_res.new_salt);
                    const hashPass = new Uint8Array(await genPassword(password,salt));
                    const updatePass = async()=>await caller.updatePasswordSettingsLayer68(salt,hashPass);
                    _res = await this.callMethod(updatePass,resp,phone,caller);
                    // console.log(_res);
                    if(_res && _res._){
                        if(_res._ == "boolTrue"){
                            resp.send({
                                result:"ok"
                            });
                            
                        }else if(_res._ == "boolFalse"){
                            this.sendError(resp,"CannotUpdate");
                        }else if(_res._ == "error"){
                            this.sendError(resp,_res.text);
                        }else{
                            this.sendError(resp,"UnknownError\n"+JSON.stringify(_res));
                        }

                    }else{
                        this.sendError(resp,"the body of enforceTwoStepVerification is empty");
                    }
 
                }else if(_res._ == "error"){
                    this.sendError(resp,_res.text);
                }else{
                    this.sendError(resp,"AlreadyHasPassword");
                }
            }else{
                this.sendError(resp,"the body of enforceTwoStepVerification:getPasswordLayer68 is empty");
            } 
        } 
    }

    public loginWithPassword = async (req:Request, resp:Response) =>{
        let { phone, code ,  password } = req.body;
        if (!this.hasValue(code)) {
            this.sendError(resp, "there must be a code field");
            return;
        }
        if (!this.hasValue(password)) {
            this.sendError(resp, "there must be a password field");
            return;
        }
        if (this.checkPhone(resp, phone, "Session does not exist in loginWithPassword")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const realPhone = `${phone.substring(0,3)} ${phone.substring(3,6)} ${phone.substring(6,9)} ${phone.substring(9)}`
            const saltRes =  await caller.getPassword();
            let theSalt;
            // console.log(saltRes);
            if(saltRes  && saltRes.current_salt ){
                theSalt = saltRes.current_salt;
            }else{
                this.sendError(resp,"Cannot get the salt");
                return;
            }
            const _res = await caller.checkPassword2(new Uint8Array(await genPassword(password,new Uint8Array(theSalt),false)),code, realPhone);//"+98 905 234 5977") 
            

            // const _res = await caller.checkPassword2(new Uint8Array(await genPassword(password,new Uint8Array([
            //     50, 101, 51, 48, 100, 102, 57, 56, 51, 52, 101, 53, 50, 54, 99, 49, 53, 48, 50, 102, 50, 50, 51, 51, 53, 56, 48, 102, 53, 100, 100, 49
            // ]))),code, realPhone);//"+98 905 234 5977") 
        
            // console.log(_res);
        
           if(_res && _res._){
                if(_res._ == "auth.authorization"){
                    const token = _res.token;
                caller.setToken(token); 
                await Bun.write(savePath+`/${(phone+"").substring(1)}`,`${caller.getImei()} ${token}`) 
                resp.send({
                    token,
                    imei: caller.getImei(),
                    user_id: _res.user.id,
                    username: _res.user.username,
                    access_hash: _res.user.access_hash

                });
                }else if(_res._ == "error" && _res.text == "PASSWORD_HASH_INVALID"){
                    this.sendError(resp,"PasswordInvalid");
                }else{
                    this.sendError(resp,"UnknownError\n");
                }
           }else{
                this.sendError(resp,"the body of loginWithPassword is empty");
           } 
        }
    } 
}

export default new AuthController();