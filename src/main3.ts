
import Caller from "./MTCaller"
import { PeerType,extractFiveDigits }  from "./utils";
import { sleep } from "bun";
import { serialize, deserialize } from "bun:jsc";

class CallerInfo{
    public token = '';
    public imei = '';
    public constructor(token:string,imei:string){
        this.imei = imei;
        this.token = token;
    }
}

export default class Main{
    private args = require('args-parser')(process.argv);
    private static instance_:Main = new Main(); 
    private caller = new Caller();
    private constructor(){}
    
    private sessions:Array<CallerInfo> = new Array<CallerInfo>()

    public static getMe(){
        return this.instance_;
    }
    async run() {

        let phone = this.args.phone + "";
        let token_ = this.args.token + "";
        let imei_ = this.args.imei + "";
        let savePath = this.args.savePath + "";

        if(savePath.length ==0 || imei_.length == 0 || token_.length == 0 || phone.length==0 ){
            console.log("Arguments are wrong");
            return;
        }
        // let phone = "+989369562335";
        // phone= "+989223611492"
        // phone = "+989052345977";
         
        

        // this.sessions.push(new CallerInfo("6665ac558582d8.48393945_15392529","swrexmfv678xm3q__web"));
        
        this.sessions.push(new CallerInfo(token_,imei_));


        try{
            for(let i=0;i<1000;i++){
            
            console.log("Session number : " + i);
            const newImei = this.caller.generateWebImei();

            this.caller.setImei(newImei);

            let res = await this.caller.sendCode(phone);
            console.log(res);
            await sleep(1000);
            
            let prev = this.sessions[this.sessions.length-1];
            
            this.caller.setImei(prev.imei);
            this.caller.setToken(prev.token);

            res = await this.caller.getHistory("333000");
            
            if(res._ && res._ == "eitaaUpdatesExpireToken"){
                console.log("Need to refresh token");
                try{
                    const res = await this.caller.refreshToken();
                    prev.token = res.token;
                    i--;
                    continue;
                }catch(e){
                    console.error("Can't Refresh Token");
                    break;
                } 
            }else if(res._ && res._ == "error"){
                console.log("Errrror 401: Login Invalid");
                break;
            }

            const code = extractFiveDigits(res.messages[0].message);
            if(code == null){
                console.log("Bad Digits");
                throw new Error("Bad Digits")
            }
            this.caller.setImei(newImei);
            this.caller.setToken("");
            await sleep(1000);
            res = await this.caller.login(phone, code);
            console.log(res.token);

            this.sessions.push(new CallerInfo(res.token,newImei));
            await sleep(1000);
        }

        }catch(e){
            this.saveSessions(savePath);
            console.error(e);
        }
        this.saveSessions(savePath);
        


        // this.caller.setImei("swrexmfv678xm3q__web");

        // const res = await this.caller.sendCode(phone);
        // console.log(res);
        // const res = await this.caller.login(phone,"54510");
        // console.log(res.token);

        // this.caller.setToken("6665ac558582d8.48393945_15392529")
        // const res = await this.caller.getHistory("333000");
        // console.log(res);

        
        // this.caller.setToken("66658e31775ea0.30520060_3298427")

        // let res = await this.caller.getContacts();
        // console.log(res);
        // res = serialize(res);
        // res = deserialize(res);
        // res.contacts.forEach((a)=>{
        //     console.log(a.user_id);
        // });

        

        // this.caller.setToken(this.args.token);
        // await this.checkNumbers(this.args.from,this.args.to)    
     

        // for(var i=0;i<9;i++)
        //     console.log(this.caller.generateWebImei());
        
        // this.caller.setToken(this.args.token);
        // this.caller.setImei(this.args.imei);
        // const res = await this.caller.refreshToken();
        // console.log("New Token: " + res.token);
        // this.caller.setToken(res.token);

        // await this.checkNumbers(this.args.from,this.args.to, this.args.phone);
    }

    private saveSessions(path:string){
        let output = "";
        this.sessions.forEach(r=>{
            output += r.imei + " " + r.token + "\n";
        });
        console.log("Output:");
        console.log(output);
        Bun.write(path,output);

    }

    // private async checkNumbers(from:number,to:number,phoneTest="") {
    //     const prefix = "+98912";
    //     for(var i=from;i< to;i++){
    //         console.log("Contact Number: " + i);
    //         let contacts = [];
    //         const res1 = prefix + i.toString().padStart(7,"0");
    //         contacts.push([res1,res1]); 
    //         const res = await this.caller.importContacts(contacts);
    //         console.log(res);
    //         await sleep(1000);
    //     }
        
    //     console.log("Contact Number: N");
    //     const res = await this.caller.importContacts([[phoneTest,phoneTest]]);
    //     console.log(res); 
    
    //    }

 

}









 