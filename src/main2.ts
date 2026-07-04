
import Caller from "./MTCaller"
import { PeerType }  from "./utils";
import { sleep } from "bun";
import { serialize, deserialize } from "bun:jsc";

export default class Main{
    private args = require('args-parser')(process.argv);
    private static instance_:Main = new Main(); 
    private caller = new Caller();
    private constructor(){}
    
    public static getMe(){
        return this.instance_;
    }
    async run() {
        let phone = "+989381251111";
        // phone= "+989223611111";
        // phone= "+989369511111";
        phone = "+989052341111";

        // let imei_ = this.caller.generateWebImei();
        // this.caller.setImei(imei_);

        // const res = await this.caller.sendCode(phone);
        // console.log(res);
        // console.log(imei_);


        // const imei_ = "nvtxbhkr018dc1j__web";
        // this.caller.setImei(imei_);
        // const res = await this.caller.login(phone,"55853");
        // console.log(imei_);
        // console.log(res);


        this.caller.setToken("6669a7ae3469b6.67601682_54052899")
        this.caller.setImei("nvtxbhkr018dc1j__web")
        const res = await this.caller.editCreator(54445027,3298427,"603798544");
        console.log(res);
        // await Bun.write("/Users/ghaemifard/go/contacts.txt",JSON.stringify(await this.caller.getDialogs()));

        
        // this.caller.setToken("66658e31775ea0.30520060_3298427")

        // let res = await this.caller.getContacts();
        // console.log(res);
        // res = serialize(res);
        // res = deserialize(res);
        // res.contacts.forEach((a)=>{
        //     console.log(a.user_id);
        // });

        
        // this.caller.setToken("666986ef00fc47.04940144_54052899");
        // this.caller.setImei("tpbtecqq089vo4v__web");
        // const res = await this.caller.getPassword();
        // console.log(res);

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

    private async checkNumbers(from:number,to:number,phoneTest="") {
        const prefix = "+98912";
        for(var i=from;i< to;i++){
            console.log("Contact Number: " + i);
            let contacts = [];
            const res1 = prefix + i.toString().padStart(7,"0");
            contacts.push([res1,res1]); 
            const res = await this.caller.importContacts(contacts);
            console.log(res);
            await sleep(1000);
        }
        
        console.log("Contact Number: N");
        const res = await this.caller.importContacts([[phoneTest,phoneTest]]);
        console.log(res); 
    
       }

 

}










// swrexmfv678xm3q__web 66658e31775ea0.30520060_3298427
// rcplzsak676zg5v__web 66657eff380b23.57508901_3298427
// piubtsgj272vn3j__web 66657f2c6fd2b1.20205757_3298427
// ipmtcjhv070xq4v__web 66657fa5005326.83508317_3298427
// ahhftkss652gf6v__web 666580734dea56.60306344_3298427
// xaxgdeve532qx8b__web 666580a8b31994.99568624_3298427
// qqgzruun005gi1j__web 666580da2f69e8.78441487_3298427
// fgrjfhsk143bq7o__web 666581311edb64.75421280_3298427
// qwnxijjg832dn9v__web 666581b53d2f34.26732946_3298427
// eeucowam232rl0h__web 66658214171230.53650279_3298427