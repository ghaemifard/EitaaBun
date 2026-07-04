
import Caller from "./MTCaller"
import { PeerType,extractFiveDigits }  from "./utils";
import { sleep } from "bun";
import { serialize, deserialize } from "bun:jsc";
import  BunDBManager  from "./db/DBManager"
import  SessionRecord  from "./db/DBManager"

class CallerInfo{
    public token = '';
    public imei = '';
    public constructor(token:string,imei:string){
        this.imei = imei;
        this.token = token;
    }
}

class Client{
    private caller = new Caller();
    private session = new CallerInfo("","");
    private sessionNumber=0;
    private processNumber=0;
    private from=0;
    private to=0;
    private prefix="+98912";
    private bDbManager = BunDBManager.getMe();

    public constructor(chunk:number,tnum:number,prefix:string){
        this.processNumber = chunk;
        this.sessionNumber = (chunk * 100 + tnum)+1;
        
        this.from = (chunk * 1_000_000 + tnum * 10_000);
        this.to = (chunk * 1_000_000 + (tnum+1) * 10_000);

        if(prefix && prefix.length==6 && prefix.startsWith("+")){
            this.prefix = prefix;
        }

        const r1 = this.bDbManager.getSessionById(this.sessionNumber);
        
        this.session.imei = r1.imei;
        this.session.token = r1.token;
        this.updateTokens();
    }

    private updateTokens(){
        this.caller.setImei(this.session.imei);
        this.caller.setToken(this.session.token);
    }
     

    public async checkNumbers() { 
        for(var i=this.from;i< this.to;i++){
            //console.log("Contact Number: " + i);
            let contacts = [];
            const res1 = this.prefix + i.toString().padStart(7,"0");
            contacts.push([res1,res1]); 
            const res = await this.caller.importContacts(contacts);
            if(res._){

                const methodName = (res._ + "").toLowerCase();
                if(methodName == "contacts.importedcontacts"){
                    try{
                        const userId = res.users[0].id;
                        const statusMehod = (res.users[0].status._ + "").toLowerCase();
                        let status=0;
                        if(statusMehod == "userstatusoffline"){
                            status = parseInt(res.users[0].status.was_online+"");
                        }else if(statusMehod == "userstatusrecently"){
                            status = -1;
                        }else if(statusMehod == "userstatuslastweek"){
                            status = -2;
                        }else if(statusMehod == "userstatuslastmonth"){
                            status = -3
                        }else if(statusMehod == "userstatusonline"){
                            status = 0;
                        }else{
                            status = -10;
                        }
                        this.bDbManager.updateContact(i,parseInt(userId),status);
                    }catch(e){

                    }

                }else if(methodName == "eitaaupdatesexpiretoken"){
                    try{
                        const res = await this.caller.refreshToken();
                        this.session.token = res.token;
                        this.updateTokens();
                        this.bDbManager.updateSessoinById(this.sessionNumber,this.session.token);
                        i--;
                    }catch(e){
                        console.error(this.toString() + "\nCan't refresh Token");
                        break;
                    }

                }else if(methodName == "error"){

                } 
            }
            await sleep(1000);
        }
         
    
       }


    public toString(){
        return `Process: ${this.processNumber} SessionNumber: ${this.sessionNumber} From: ${this.from} To: ${this.to}`;
    }
    public async toString2(){
        return `Prefix: ${this.prefix} Process: ${this.processNumber} SessionNumber: ${this.sessionNumber} From: ${this.from} To: ${this.to} Token: ${this.session.token}`;
    }

}

export default class Main{
    private args = require('args-parser')(process.argv);
    private static instance_:Main = new Main(); 
    private caller = new Caller();
    private constructor(){}
    private bDbManager = BunDBManager.getMe();
    private sessions:Array<CallerInfo> = new Array<CallerInfo>()
    
    public static getMe(){
        return this.instance_;
    }

    async run() {

        //fill session table
        // this.init();
        // const path="/Users/ghaemifard/Downloads/9381259655_1.txt";
        // this.readSessionsFromFileAndWriteToDb(path);
        // return;
        const chunk = this.args.chunk + "";
        // let readDB = this.args.readDB;
        const prefix = this.args.prefix + "";
        if(prefix.length != 6 || chunk.length !=1  ){
            console.log("Example: \n\tbun run index.ts --chunk=0 --prefix=+98912");
            return;
        }
        
        //init
        this.init();


        
        //real-work
        let proms=[];
        const MySize= 100;
        let instances= new Array<Client>();
        for(var i=0;i<100;i++){
            instances.push(new Client(parseInt(chunk),i,prefix))
            proms.push(instances[instances.length-1].toString2());
        }

        try {
            const results = await Promise.all(proms);
            console.log(results);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        

        
    }

    private init(){
        this.bDbManager.createTables();
    }

    private readSessionsFromFileAndWriteToDb(path:string){
         
        
        try{
            Bun.file(path).text().then((content)=>{
                content.split("\n").forEach((line)=>{
                    if(line.length>0){
                        const arr = line.split(" ");
                        if(arr.length==2){
                            this.bDbManager.insertSession(arr[0],arr[1]);
                        }
                    }
                })

                
            }).catch((e)=>{
                console.error(e);
            })

        }catch(e){
            console.error(e);
        } 
    }
    async run0() {
        let phone = "+989369561111";
        // phone= "+989223611111"
        // phone = "+98905231111";


        this.sessions.push(new CallerInfo("6665ac558582d8.48393945_15392529","swrexmfv678xm3q__web"));

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
                break;
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
            this.saveSessions();
            console.log(e);
        }
        this.saveSessions();
        


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

    private saveSessions(){
        let output = "";
        this.sessions.forEach(r=>{
            output += r.imei + " " + r.token + "\n";
        });
        console.log("Output:");
        console.log(output);
        Bun.write("/Users/ghaemifard/sessions.txt",output);

    }

    

}









 
