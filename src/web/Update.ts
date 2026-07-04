import { file, write } from "bun";
import Caller from "../MTCaller";
import { savePath } from "../utils";

export default class Update{
    private caller:Caller;
    private phone:string; 
    private static map = new Map();
    private began = false;
    private interValid:Timer ;
    public static urlForParsedData = "http://127.0.0.1:8080";
    private url = "";
    public setUrl(u:string){
        this.url = u;
    }
    private constructor(phone:string,caller:Caller){
        this.caller = caller;
        this.phone = phone;
    }

    public static createInstance(phone:string,caller:Caller){
        if(this.map.has(phone)){
            return Update.map.get(phone);
        }else{
            const inst = new Update(phone,caller);
            Update.map.set(phone,inst);
            return inst;
        } 
    }

    private async sendReq(data:any){
        //console.log("Sending data:"+data);
        if(!this.url || this.url==""){
            return;
        } 
        try {
            const response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({phone:this.phone,platform:"eitaa",updates:data})
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const responseData = await response.json();
            // console.log('Response:', responseData);
        } catch (e) {
            console.error('Error:', e);
        }
         
    }

    private async send(data:any){
        //console.log("Sending data: "+data);
        if(Update.urlForParsedData == null || Update.urlForParsedData.length<=5){
            return;
        } 
        try {
            const response = await fetch(Update.urlForParsedData, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({phone:this.phone,platform:"eitaa",updates:data})
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const responseData = await response.json();
            // console.log('Response:', responseData);
        } catch (e) {
            console.error('Error:', e);
        }
         
    }

    

    private getUser(users:any,userId:string){
        if(userId==null || userId.length ==0){
            return null;
        }
        for(let i=0;i<users.length;i++){
            if(userId == users[i].id){
                return users[i];
            }
        }
        return null;
    }
    private async callGetChannelDifference(state:any,channel_id:number){
        if(state){
            const res =await this.caller.getChannelDifference(channel_id,state.pts);
            // console.log(res);
            if(res && res._){
                if(res._ == "eitaaUpdatesExpireToken"){
                    this.updateToken(); 
                    this.callGetChannelDifference(state,channel_id);
                    return;
                }

                if(res._ == "updates.channelDifference"){ 
                    if(res.new_messages && res.new_messages.length>0){
                        this.sendReq(res).then(()=>{});;
                        await Bun.write(`${savePath}/${this.phone.substring(1)}_${channel_id}_state`,JSON.stringify({pts:res.pts}));
                        const messages = res.new_messages;
                        const users = res.users;
                        // console.log(messages);
                        const msgs=new Array<any>();
                        for(let i=0;i<messages.length;i++){
                            const msg = messages[i];
                            if(msg._ == "message"){
                                const u1 = this.getUser(users,msg.from_id.user_id);
                                msgs.push({
                                    type:"MSG_GROUP",
                                    message:msg.message,
                                    fromMe: (msg.pFlags && msg.pFlags.out!=null) ? msg.pFlags.out : false,
                                    from_id: (msg.from_id.user_id)? msg.from_id.user_id:msg.from_id ,
                                    from_acces_hash: (u1)? u1.access_hash :null, 
                                    group_id:channel_id,
                                    date: msg.date,
                                    media: msg.media

                                });
                            }else if(msg._ == "messageService"){
                                if(msg.action){
                                    if(msg.action._ =="messageActionChatAddUser"){
                                        const map = new Map();
                                        const lsUsers=new Array<any>();
                                        for(let j=0;j<msg.action.users.length;j++){
                                            const theU = msg.action.users[j];
                                            for(let i=0;i<users.length;i++){
                                                const u=users[i];
                                                if(u.id ==  theU){
                                                    lsUsers.push({
                                                        user_id: u.id,
                                                        acess_hash: u.access_hash
                                                    });
                                                    break;
                                                }
                                            }
                                        }
                                        msgs.push({
                                            type:"MSG_GROUP_ADD_USERS", 
                                            users: lsUsers ,
                                            // peer: msg.peer_id,
                                            group_id:channel_id,
                                            date: msg.date
        
                                        });
                                    }else if(msg.action._ =="messageActionChatJoinedByLink"){
                                        let user;
                                        for(let i=0;i<users.length;i++){
                                            
                                            if(users[i].id ==  msg.from_id.user_id){
                                                user = users[i];
                                                break;
                                            }
                                        }

                                        msgs.push({
                                            type:"MSG_GROUP_JOINED_USER", 
                                            user_id: msg.from_id.user_id,
                                            access_hash: (user)? user.access_hash : null, 
                                            group_id:channel_id,
                                            date: msg.date
        
                                        });
                                    }else if(msg.action._ =="messageActionChatDeleteUser"){
                                        let user;
                                        for(let i=0;i<users.length;i++){ 
                                            if(users[i].id ==  msg.action.user_id){
                                                user = users[i];
                                                break;
                                            }
                                        }
                                        msgs.push({
                                            type:"MSG_GROUP_REVOKE_USER", 
                                            user_id: msg.action.user_id,
                                            access_hash:(user)? user.access_hash : null, 
                                            group_id:channel_id,
                                            date: msg.date
        
                                        });
                                    }
                                }
                            }
                        }
                        //send msgs
                        if(msgs.length>0){
                            this.send({
                                messages:msgs
                            });
                        }
                    }
                    
                }else if(res._ == "updates.channelDifferenceTooLong"){
                    this.sendReq(res).then(()=>{});;
                    // await Bun.write(`${savePath}/${this.phone.substring(1)}_${channel_id}_state`,JSON.stringify({pts:res.pts}));
                    this.send({
                        type:"MSG_GROUP_TOO_LONG",
                        top_message:res.dialog.top_message,
                        read_inbox_max_id:res.dialog.read_inbox_max_id,
                        read_outbox_max_id:res.dialog.read_outbox_max_id,
                        channel_id: res.dialog.peer.channel_id,
                        unread_count: res.dialog.unread_count
                    }).then(()=>{});
                    // console.log("PTSSSSS: "+res.dialog.pts);
                    await Bun.write(`${savePath}/${this.phone.substring(1)}_${channel_id}_state`,JSON.stringify({pts:res.dialog.pts}));
                }else{
                    //save state for empy channel
                    console.log(res);
                    // await Bun.write(`${savePath}/${this.phone.substring(1)}_${channel_id}_state`,JSON.stringify({pts:res.pts}));
                }
            }
        }
    }

    private async  runChannel(channel_id:number){
        //load channel file
        let state:any;
        try{
            state = await Bun.file(`${savePath}/${this.phone.substring(1)}_${channel_id}_state`).json();
        }catch(e){
            state = {pts:0};
        }
        if(state == null || state.pts == null){
            state = {pts:0};
        } 

        this.callGetChannelDifference(state,channel_id);
    }

    private async callGetDifference(state:any){
        console.log("---------------------------------------");
        if(state){
            const res= await this.caller.getDifference(state.pts,state.date);
            
            if(res && res._){
                console.log(res);
                // return;
                if(res._ == "eitaaUpdatesExpireToken"){
                    this.updateToken(); 
                    return;
                }
                if(res._ == "error" && res.text != null && res.text=="INVALID_LOGIN" ){
                    const stt = await this.caller.getState();
                    this.callGetDifference(stt);
                    return;
                }
                if(res._ == "updates.difference"){
                    const new_messages = res.new_messages;
                    this.sendReq(res).then(()=>{}); 
                    let msgs = new Array<any>();
                    if(new_messages && new_messages.length>0){
                        
                        for(let i=0;i<new_messages.length;i++){
                            const msg = new_messages[i];
                           
                            
                            if(msg._ == "message"){
                                // console.log(msg);
                                let u1 = this.getUser(res.users, msg.from_id.user_id);
                                console.log(u1);
                                msgs.push({
                                    type:"MSG_USER",
                                    message:msg.message,
                                    fromMe: (msg.pFlags && msg.pFlags.out!=null) ? msg.pFlags.out : false,
                                    from: (msg.from_id.user_id)? msg.from_id.user_id:msg.from_id ,
                                    from_access_hash: (u1)? u1.access_hash :null,
                                    media: msg.media,
                                    date: msg.date

                                });
                            }else if(msg._ == "messageService"){
                                // console.log(msg);
                                if(msg.action){
                                    if(msg.action._ == ""){

                                    }
                                    // else if(msg.action._ == ""){

                                    // }
                                }
                            }
                        } 

                       
                    } 

                    const other_updates = res.other_updates;
                    const ls = new Array<number>();
                    if(other_updates && other_updates.length>0){

                        for(let i=0;i<other_updates.length;i++){
                            const update=other_updates[i];
                            if(update._ == "updateNewChannelMessage"){
                                // console.log(update);
                                if(update.message && update.message.action && update.message.action._ == "messageActionChannelMigrateFrom"){
                                    if(update.message.peer_id && update.message.peer_id.channel_id){
                                        const channel_id = update.message.peer_id.channel_id;
                                        if(channel_id){
                                            const initData={
                                                pts:0
                                            }
                                            const b = await Bun.file(`${savePath}/${this.phone.substring(1)}_${channel_id}_state`).exists();
                                            if(!b)
                                                await Bun.write(`${savePath}/${this.phone.substring(1)}_${channel_id}_state`, JSON.stringify(initData));
                                        }
                                    }
                                    // else{
                                    //     console.log( update );
                                    // }
                                    
                                }
                            }else if(update._ == "updateChannel" || update._ == "updateChannelTooLong" || update._ == "updateReadChannelInbox"){
                                if(ls.findIndex((x)=>x==update.channel_id) == -1){
                                    // console.log(update.channel_id);
                                    ls.push(update.channel_id);
                                    await this.runChannel(update.channel_id);
                                    // this.runChannel(update.channel_id).then(()=>{

                                    // });
                                }

                            } 
                        }
                    }

                     //send msgs to the server 
                    if(msgs.length>0){
                        this.send({
                            messages:msgs
                        });
                    } 

                    const _state = res.state;
                    // console.log(_state);
                    this.callGetDifference(_state);
                    await Bun.write(`${savePath}/${this.phone.substring(1)}_state`, JSON.stringify(_state));
                }else if(res._ == "updates.differenceEmpty"){
                    //save the state
                    const _state = res.state;
                    // console.log(res);
                    // console.log("Path:" + `${savePath}/${this.phone.substring(1)}_state`);
                    await Bun.write(`${savePath}/${this.phone.substring(1)}_state`, JSON.stringify(state));
                }
            }
        }
    }


    private async updateToken(){
        const res = await this.caller.refreshToken();
        if(res && res._){
            if(res._ == "eitaa_updates_token"){
                console.log("Token: "+ res.token);
                this.caller.setToken(res.token);
                await Bun.write(savePath + `/${this.phone.startsWith("+") ? this.phone.substring(1) : this.phone}`, `${this.caller.getImei()} ${this.caller.getToken()}`)
            }
        } 
    }

    private async run(){
        //load the state of mobile number
        let state;
        try{
            state = await Bun.file(`${savePath}/${this.phone.substring(1)}_state`).json();
        }catch(e){
            // state = await this.caller.getState();
            //console.log(state);
            state = {pts:0,date:0};
        }

        if(state == null || state.pts == null){
            state = {pts:0,date:0};
        }
       
        await this.callGetDifference(state);
    }
    public start(){
        if(!this.began){
            this.began = true; 
            this.interValid = setInterval(()=>{
                 this.run().then(()=>{
                    console.log("===============Finished================")
                 });
            },10000);

        }
    }

    public stop(){
        clearInterval(this.interValid);
        this.began = false;
    }
}