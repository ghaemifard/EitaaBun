import type { Request, Response } from 'express';
import Caller from '../MTCaller';
import { PeerType, generateWebImei, savePath } from '../utils';
import Controller from './Controller';
import SessionManager from './SessionManager';



class MessageController extends Controller {

    public sendMessage = async (req: Request, resp: Response) => {
        let { phone, message, id, access_hash, type, replyTo } = req.body;
        let tp = PeerType.CHANNEL;
        if (type) {
            if (type == "user") {
                tp = PeerType.USER
            } else if (type == "chat") {
                tp = PeerType.CHAT;
            } else {
                tp = PeerType.CHANNEL
            }
        } else {
            tp = PeerType.CHANNEL;
        }

        if (!this.hasValue(access_hash)) {
            access_hash = 0;
        }
        if (!this.hasValue(message)) {
            this.sendError(resp, "there must be a message field");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field");
            return;
        }






        if (this.checkPhone(resp, phone, "Session does not exist in sendMessage")) {
            const caller: Caller = SessionManager.getMe().get(phone);

            const send_ = async () => await caller.sendMessage(message, id, access_hash, tp, replyTo);
            const _res = await this.callMethod(send_, resp, phone, caller);


            if (_res && _res._) {
                if (_res._ == "updateShortSentMessage" || _res._ == "updates") {
                    resp.send({
                        result: "ok"
                    });
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in sendMessage:\n" + _res);
                }
            } else {
                this.sendError(resp, "the body of sendMessage is empty");
            }

        }


    }
    public sendMedia = async (req: Request, resp: Response) => {
        let { phone, message, id, access_hash, type, media_type, path } = req.body;

        if (!media_type) {
            media_type = "photo"
        }
        let tp = PeerType.CHANNEL;
        if (type) {
            if (type == "user") {
                tp = PeerType.USER
            } else if (type == "chat") {
                tp = PeerType.CHAT;
            } else {
                tp = PeerType.CHANNEL
            }
        } else {
            tp = PeerType.CHANNEL;
        }

        if (!this.hasValue(access_hash)) {
            access_hash = 0;
        }
        if (!this.hasValue(path)) {
            this.sendError(resp, "there must be a path field");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field");
            return;
        }
        if (!message) {
            message = "";
        }


        if (this.checkPhone(resp, phone, "Session does not exist in sendMedia")) {
            const caller: Caller = SessionManager.getMe().get(phone);

            await this.callMethod(async()=>await caller.getState() ,resp,phone,caller);
            const upload = async () => await caller.uploadFile(path, tp);
            const file = await this.callMethod(upload, resp, phone, caller);
            if (!file) {
                this.sendError(resp, "there is no file");
                return;
            }

            let _res;
            if (media_type == "photo") {
                const send_ = async () => await caller.sendPhoto(id, access_hash, tp, file, message);
                _res = await this.callMethod(send_, resp, phone, caller);
            } else if (media_type == "file") {
                const send_ = async () => await caller.sendFile(id, access_hash, tp, file, message);
                _res = await this.callMethod(send_, resp, phone, caller);
            } else {
                this.sendError(resp, `media type ${media_type} is not supported`);
                return;
            }
            console.log(_res);

            if (_res && _res._) {
                if (_res._ == "updateShortSentMessage" || _res._ == "updates") {
                    resp.send({
                        result: "ok"
                    });
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in sendMedia:\n" + _res);
                }
            } else {
                this.sendError(resp, "the body of sendMedia is empty");
            }
        }



    }
    public forwardMessage = async (req: Request, resp: Response) => {
        let { phone, from_id, from_access_hash,
            from_type, to_id, to_access_hash, to_type,fw_msg_ids,with_auther } = req.body;

        if (!this.hasValue(to_access_hash)) {
            to_access_hash = 0;
        }

        if (!this.hasValue(from_access_hash)) {
            from_access_hash = 0;
        }

        if (!this.hasValue(from_id)) {
            this.sendError(resp, "there must be a from_id field");
            return;
        }
        if (!this.hasValue(to_id)) {
            this.sendError(resp, "there must be a to_id field");
            return;
        } 
        if (!this.hasValue(fw_msg_ids)) {
            this.sendError(resp, "there must be a fw_msg_ids field");
            return;
        }
        if(with_auther == null){
            with_auther= false;
        } 

        let from_tp = PeerType.CHANNEL;
        if (from_type) {
            if (from_type == "user") {
                from_tp = PeerType.USER
            } else if (from_type == "chat") {
                from_tp = PeerType.CHAT;
            } else {
                from_tp = PeerType.CHANNEL
            }
        } else {
            from_tp = PeerType.CHANNEL;
        } 

        let to_tp = PeerType.CHANNEL;
        if (to_type) {
            if (to_type == "user") {
                to_tp = PeerType.USER
            } else if (from_type == "chat") {
                to_tp = PeerType.CHAT;
            } else {
                to_tp = PeerType.CHANNEL
            }
        } else {
            from_tp = PeerType.CHANNEL;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in forwardMessage")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            
            const forward = async()=>await caller.forwardMessages(fw_msg_ids,from_id,from_tp,to_id,to_tp,from_access_hash,to_access_hash,with_auther);

            const _res = await this.callMethod(forward,resp,phone,caller);

            if(_res && _res._){ 
                if(_res._ == "updates"){
                    resp.send({
                        result:"ok"
                    });
                }else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in forwardMessage:\n" + JSON.stringify(_res));
                }

            }else{
                this.sendError(resp, "the body of forwardMessage is empty");
            }
        } 

    }
    public pinMessage = async (req: Request, resp: Response) => {
        let { phone, id, access_hash,  msg_id,type, unpin } = req.body;

       
        if (!this.hasValue(msg_id)) {
            this.sendError(resp, "there must be a msg_id field");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field");
            return;
        }
        if(!access_hash){
            access_hash=0;
        }
        if(unpin==null){
            unpin = false;
        }
         

        let tp = PeerType.CHANNEL;
        if (type) {
            if (type == "user") {
                tp = PeerType.USER
            } else if (type == "chat") {
                tp = PeerType.CHAT;
            } else {
                tp = PeerType.CHANNEL
            }
        } else {
            tp = PeerType.CHANNEL;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in pinMessage")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const pin = async()=>await caller.updatePinnedMessage(tp, msg_id , id,access_hash,!unpin);
            const _res = await this.callMethod(pin,resp,phone,caller);
            if(_res && _res._){ 
                if(_res._ == "updates"){
                    resp.send({
                        result:"ok"
                    });
                }else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in pinMessage:\n" + JSON.stringify(_res));
                }

            }else{
                this.sendError(resp, "the body of pinMessage is empty");
            }
        }

    }
    public editMessage = async (req: Request, resp: Response) => {
        let { phone, id, access_hash, message, msg_id,type } = req.body;
        if(!message){
            message = "";
        }
        if (!this.hasValue(msg_id)) {
            this.sendError(resp, "there must be a msg_id field");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field");
            return;
        }
        if(!access_hash){
            access_hash=0;
        }
        if(!message){
            message="";
        }

        let tp = PeerType.CHANNEL;
        if (type) {
            if (type == "user") {
                tp = PeerType.USER
            } else if (type == "chat") {
                tp = PeerType.CHAT;
            } else {
                tp = PeerType.CHANNEL
            }
        } else {
            tp = PeerType.CHANNEL;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in editMessage")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const edit = async()=>await caller.editMessage(message,id,access_hash,msg_id,tp);
            const _res= await this.callMethod(edit,resp,phone,caller);
            if(_res && _res._){ 
                if(_res._ == "updates"){
                    resp.send({
                        result:"ok"
                    });
                }else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in editMessage:\n" + JSON.stringify(_res));
                } 
            }else{
                this.sendError(resp, "the body of editMessage is empty");
            }
        }

    }

    public deleteMessage = async (req: Request, resp: Response) => {
        let { phone, msg_ids,type,id,access_hash } = req.body;
        if (!this.hasValue(msg_ids)) {
            this.sendError(resp, "there must be a msg_ids field");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field");
            return;
        }
        if(!access_hash){
            access_hash=0;
        }

        let tp = PeerType.CHANNEL;
        if (type) {
            if (type == "user") {
                tp = PeerType.USER
            } else if (type == "chat") {
                tp = PeerType.CHAT;
            } else {
                tp = PeerType.CHANNEL
            }
        } else {
            tp = PeerType.CHANNEL;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in deleteMessage")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            
            let del;
            // let _res;
            if(tp==PeerType.CHANNEL){
                del = async() =>await caller.deleteChannelMessage(msg_ids,id);
            }else{
                del = async() =>await caller.deleteMessage(msg_ids,true);
            }
            const _res =  await this.callMethod(del,resp,phone,caller);
            
            if(_res && _res._){
                if(_res._ == "messages.affectedMessages"){
                    resp.send({
                        result:"ok"
                    });
                }else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in deleteMessage:\n" + JSON.stringify(_res));
                }
            }else{
                this.sendError(resp, "the body of deleteMessage is empty");
            }
        }

    }

    public readMessage = async (req: Request, resp: Response) => {
        let { phone, id, access_hash, type, offset, size,downward } = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field");
            return;
        }
        if (!this.hasValue(access_hash)) {
            access_hash = 0;
        }

        let tp = PeerType.CHANNEL;
        if (type) {
            if (type == "user") {
                tp = PeerType.USER
            } else if (type == "chat") {
                tp = PeerType.CHAT;
            } else {
                tp = PeerType.CHANNEL
            }
        } else {
            tp = PeerType.CHANNEL;
        }

        if (!offset) {
            offset = 0;
        }
        if (!size) {
            size = 1000;
        }
        if(downward == null){
            downward = false;
        }
        let addOffset = 0
        if(downward){
            addOffset = -1 * size;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in readMessage")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            
            const read = async () => await caller.getHistory(id, tp, offset, addOffset, size);

            const _res = await this.callMethod(read, resp, phone, caller);
            if (_res && _res._) {
                if ((_res._ == "messages.messagesSlice" || _res._ == "messages.channelMessages") && _res.messages) {
                    const ls = []
                    for (let i = 0; i < _res.messages.length; i++) {
                        ls.push({
                            id: _res.messages[i].id,
                            text: _res.messages[i].message,
                            date: _res.messages[i].date,
                            from: _res.messages[i].from_id,
                            to: _res.messages[i].peer_id,
                            media: _res.messages[i].media,
                            fwd: _res.messages[i].fwd_from
                        });
                    }
                    resp.send({
                        messages: ls
                    });

                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in readMessage:\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "the body of readMessage is empty");
            }
        } 
    }

    public markMessageAsRead = async (req: Request, resp: Response) => {
        let { phone, id, access_hash, type, msg_id } = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field");
            return;
        }
        if (!access_hash) {
            access_hash = 0;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in markMessageAsRead")) {
            const caller: Caller = SessionManager.getMe().get(phone);

            let method;
            if (type == "user") {
                method = async () => await caller.readMessageHistory(msg_id, id,access_hash)
            } else {
                method = async () => await caller.readChannelHistory(msg_id, id)
            }

            const _res = await this.callMethod(method, resp, phone, caller);
            if (_res && _res._) {
                if (_res._ == "boolTrue") {
                    resp.send({
                        result: "ok"
                    });

                } else if (_res._ == "boolFalse") {
                    this.sendError(resp, "cannot mark messages");
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in markMessageAsRead:\n" + JSON.stringify(_res));
                } 
            } else {
                this.sendError(resp, "the body of markMessageAsRead is empty")
            }

        }

    }
    public getDialogs = async (req: Request, resp: Response) => {
        let { phone , date} = req.body;

        if (!date) {
            date = 0;
        }
        if (this.checkPhone(resp, phone, "Session does not exist in getDialogs")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const _res = await this.callMethod(async()=>await caller.getDialogs(0,100,date), resp, phone, caller);
            if (_res && _res._) {
                if (_res._ == "messages.dialogs" || _res._ == "messages.dialogsSlice") {
                    resp.send({
                        last_date:_res?.messages[0]?.date,
                        dialogs:_res.dialogs,
                        messages:_res.messages,
                        chats:_res.chats,
                        users:_res.users
                    })

                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in getDialogs:\n" + JSON.stringify(_res));
                } 
            } else {
                this.sendError(resp, "the body of getDialogs is empty")
            }
        }
    }

    public getFile = async (req: Request, resp: Response) => {
        let { phone, id,access_hash,file_reference, type,offset} = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field");
            return;
        }
        if (!this.hasValue(access_hash)) {
            this.sendError(resp, "there must be an access_hash field");
            return;
        }
        if (!this.hasValue(file_reference)) {
            this.sendError(resp, "there must be a file_reference field");
            return;
        }

        if(!type){
            type = "photo";
        }

        if(!offset){
            offset = 0;
        }


        if (this.checkPhone(resp, phone, "Session does not exist in getFile")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            let _res;
            if(type=="photo"){
                _res = await this.callMethod(  async()=>await caller.getPhoto(Object.values(file_reference),id,access_hash,offset)  ,resp,phone,caller);
            }else{
                _res = await this.callMethod(  async()=>await caller.getDocumentFile(Object.values(file_reference),id,access_hash,offset)  ,resp,phone,caller);
            }


            if(_res && _res._){
                if(_res._ == "upload.file"){
                    resp.send({
                        data:[..._res.bytes]
                    });
                    
                }else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in getFile:\n" + JSON.stringify(_res));
                } 
            }else{
                this.sendError(resp, "the body of getFile is empty")
            }
        }
    }
}
export default new MessageController();

