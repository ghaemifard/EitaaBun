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

        
        // this.client.setToken("6663f4676ad4e3.65140374_54052899");


        // let res = await this.client.getFullUser("54052899","947710453");
        // let res = await this.client.getFullChannel("54066254");

        // // let res = await this.client.importContacts(["+989223611111"]);
        // let res = await this.client.getHistory("3298427");
        // // let res = await this.client.forwardMessage([60,59,58],"3298427","user","54068831","chat","0","0")
        // // let res = await this.client.editMessage("Test2","3298427","603798544",62);
        
        // const res = await this.client.sendMessage2("TestRep","3298427","603798544",114);

        // let res = await this.client.getState();



        this.caller.setToken("66653141846ea4.43438637_15392529");
        // // const res = await this.caller.sendMessage("Test","54066254","0",PeerType.CHANNEL); 
        // // const res = await this.caller.sendMessage("Test10","3298427","603798544",PeerType.USER);
        // const res = await this.caller.editMessage("TestTestTest","3298427","603798544",126);
        // const res = await this.caller.deleteMessage([125,124]);

        // const res = await this.caller.sendCode("+989369562111");
        // const res = await this.caller.login("+989369562111","83172");

        // const res = await this.caller.importContacts([["+989172174111","electro"]])
        // const res = await this.caller.createGroup("Test",["21129658"]);

        // const res = await this.caller.createChannel("aaa","aaa");

        // for(let i=0;i<500;i++){
        //     console.log("Channel Number "+i);
        //     // const res = await this.caller.createGroup("گروه عمومی: "+ i,["21129658"]);
        //     const res = await this.caller.createChannel("کانال عمومی: "+ i,"Hi "+i+" and Hello" + i);
        //     // sleep(1000); 
        //     console.log(res);
        // }

        // let prefix = "+98912"
        // for(let i=0;i<100;i++)
        
        // console.log(res);
        // let num = 3318;
        // console.log('0917102' + num.toString().padStart(4,"0"));

        // await Bun.write("/Users/ghaemifard/anime/testt.txt",'0917102' + num.toString().padStart(4,"0"));
        
        // let res = await this.caller.getContacts(); 
        // let res = await this.caller.refreshToken();

        // await Bun.write("/Users/ghaemifard/anime/testt.txt",JSON.stringify(res));
         
        // const res = await this.caller.getContacts();
        // console.log(res);
        // return;

         

        let prefix = "+98912";
        let contacts = [];
        let chunk = 0;
        const SIZE = 1;
        // for(var i=10000*chunk;i<= ((10000*(chunk+1))-1);i++){
        //     const res = prefix + i.toString().padStart(7,"0")
        //     contacts.push([res,res]); 
        // }

        // contacts.push(["+989223611492","+989223611111"]);
        // contacts.push(["+989381993012","+989381111111"]);

        // for(var i=0;i<= 100;i++){
        //     console.log("Contact Number: " + i);
        //     let contacts = [];
        //     const res1 = prefix + i.toString().padStart(7,"0");
        //     contacts.push([res1,res1]); 
        //     const res = await this.caller.importContacts(contacts);
        //     console.log(res);
        //     await sleep(1000);
        // }

        // return;

        // for(var i=SIZE*chunk;i<= ((SIZE*(chunk+1))-1);i++){
        //     let contacts = [];
        //     const res1 = prefix + i.toString().padStart(7,"0");
        //     contacts.push([res1,res1]); 
        //     const res = await this.caller.importContacts(contacts);

        // }
        // console.log(contacts);
        
        // const res = await this.caller.importContacts(contacts);
        // console.log(res);

        let proms=[];
        const MySize= 100;
        for(var i=0;i<100;i++){
            proms.push(this.checkNumbers(i*MySize,(i+1)*(MySize)));
        }

        try {
            const results = await Promise.all(proms);
            console.log(results);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    
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