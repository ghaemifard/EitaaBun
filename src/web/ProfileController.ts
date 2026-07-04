import type { Request, Response } from 'express';
import Caller from '../MTCaller';
import { PeerType, generateWebImei, savePath } from '../utils';
import Controller from './Controller';
import SessionManager from './SessionManager';
import Update from './Update';

class ProfileController extends Controller {

    public changeProfile = async (req: Request, resp: Response) => {
        const { phone,  firstName,lastName, description } = req.body;
        if (this.checkPhone(resp, phone, "Session does not exist in changeProfile")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const editp = async()=>await caller.updateProfile(firstName,lastName,description);
            const _res = await this.callMethod(editp,resp,phone,caller);
            if(_res && _res._){
                if (_res._ == "user") { 
                    resp.send({
                        result:"ok"
                    }); 
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in changeProfile:\n" + JSON.stringify(_res));
                }
            }else{
                this.sendError(resp,"the body of changeProfile is empty");
            }
        }
    }
    public changeProfilePicture = async (req: Request, resp: Response) => {
        const { phone, path } = req.body;
        if (!this.hasValue(path)) {
            this.sendError(resp, "there must be a path field in changeProfilePicture");
            return;
        }
        

        if (this.checkPhone(resp, phone, "Session does not exist in changeProfilePicture")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            await this.callMethod(async()=>await caller.getState() ,resp,phone,caller);

            const uploadFile = async () => await caller.uploadFile(path, null);
            const file = await this.callMethod(uploadFile, resp, phone, caller);
            if (file) {
                const editPhoto = async () => await caller.uploadProfilePhoto(file);
                const _res = await this.callMethod(editPhoto, resp, phone, caller);
                if (_res && _res._  ) {
                    if(_res._ == "photos.photo"){
                        resp.send({
                            result: "ok"
                        });
                    } else if (_res._ == "error") {
                        this.sendError(resp, _res.text);
                    } else {
                        this.sendError(resp, "Unknown problem in changeProfilePicture:\n" + JSON.stringify(_res));
                    }
                    
                }else{
                    this.sendError(resp,"the body of changeProfilePicture is empty");
                }
            } else {
                this.sendError(resp, "cannot upload file in changeProfilePicture");
            }
        }

    }
    public getSessions = async (req: Request, resp: Response) => {
        const { phone } = req.body;
        

        if (this.checkPhone(resp, phone, "Session does not exist in getSessions")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const session = async()=>await caller.getAuthorizations();
            const _res = await this.callMethod(session,resp,phone,caller);
            if(_res && _res._){
                if (_res._ == "account.authorizations") { 
                    if(_res.authorizations && _res.authorizations.length>0 ){
                        const ls = [];
                        for(let i=0;i <_res.authorizations.length;i++){
                            ls.push({ 
                                hash: _res.authorizations[i].hash,
                                name: _res.authorizations[i].app_name,
                                version: _res.authorizations[i].app_version,
                                model: _res.authorizations[i].device_model,
                                creadtedAT: _res.authorizations[i].date_created,
                                ip: _res.authorizations[i].ip,

                            });
                        }
                        resp.send({
                            sessions: ls
                        }); 

                    }else{
                        resp.send({
                            sessions: []
                        }); 
                    }
                     
                    
                }  else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in getSessions:\n" + JSON.stringify(_res));
                }
            }else{
                this.sendError(resp,"the body of getSessions is empty");
            }
        }

    }
    public changePrivacyToLimitAddGroup = async (req: Request, resp: Response) => {
        const { phone } = req.body;
        if (this.checkPhone(resp, phone, "Session does not exist in changeGroupPicture")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const privacy = async()=>await caller.setPrivacy();
            const _res = await this.callMethod(privacy,resp,phone,caller);
            if(_res && _res._){
                if (_res._ == "account.privacyRules") {
                   
                    resp.send({
                        result:"ok"
                    });

                   
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in changePrivacyToLimitAddGroup:\n" + JSON.stringify(_res));
                }
            }else{
                this.sendError(resp,"the body of changePrivacyToLimitAddGroup is empty");
            }
        } 
    }
    public setUsername = async (req: Request, resp: Response) => {
        const { phone,username } = req.body;
        if (!this.hasValue(username)) {
            this.sendError(resp, "You must fill the username");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in setUsername")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const u_name = async()=>await caller.updateUsername(username);
            const _res = await this.callMethod(u_name,resp,phone,caller);
            if(_res && _res._){
                if (_res._ == "user") { 
                    resp.send({
                        result:"ok"
                    }); 
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in setUsername:\n" + JSON.stringify(_res));
                }
            }else{
                this.sendError(resp,"the body of setUsername is empty");
            }
        } 
    }
    public checkUsername = async (req: Request, resp: Response) => {
        const { phone,username } = req.body;
        if (!this.hasValue(username)) {
            this.sendError(resp, "You must fill the username");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in checkUsername")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const u_name = async()=>await caller.checkUsername(username);
            const _res = await this.callMethod(u_name,resp,phone,caller);
            if(_res && _res._){
                if (_res._ == "boolTrue") { 
                    resp.send({
                        result:"ok"
                    }); 
                } else if (_res._ == "boolFalse") {
                    this.sendError(resp, `The username ${username}  is already exist`);
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in checkUsername:\n" + JSON.stringify(_res));
                }
            }else{
                this.sendError(resp,"the body of checkUsername is empty");
            }
        }
    }

    public getPic = async (req: Request, resp: Response) => {
        let { phone, photo_id,local_id,volume_id,offset, id,access_hash,type } = req.body;
        if (!this.hasValue(photo_id)) {
            this.sendError(resp, "You must fill the photo_id field");
            return;
        }
        if (!this.hasValue(local_id)) {
            this.sendError(resp, "You must fill the local_id field");
            return;
        }
        if (!this.hasValue(volume_id)) {
            this.sendError(resp, "You must fill the volume_id field");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field");
            return;
        } 
        if (!this.hasValue(type)) {
            this.sendError(resp, "You must fill the type field");
            return;
        }

        if(!offset){
            offset=0;
        }
        if(!access_hash){
            access_hash = 0;
        }
        let tp = PeerType.CHANNEL;
        if(type=="user"){
            tp = PeerType.USER
        }
        if (this.checkPhone(resp, phone, "Session does not exist in getPic")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const getPic = async()=>await caller.getProfilePhoto(photo_id,local_id,volume_id,id,tp,access_hash,offset);
            const _res = await this.callMethod(getPic,resp,phone,caller);
            if(_res && _res._){
                if(_res._ == "upload.file"){
                    resp.send({
                        data:[..._res.bytes]
                    });
                }else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem in getPic:\n" + JSON.stringify(_res));
                }
            }else{
                this.sendError(resp,"the body of getPic is empty");
            }
        }

        
    }

    public getPicInfo = async (req: Request, resp: Response) => {
        let { phone, id,access_hash,type } = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field");
            return;
        }
        // if (!this.hasValue(access_hash)) {
        //     this.sendError(resp, "You must fill the access_hash field");
        //     return;
        // }
        if (!this.hasValue(type)) {
            this.sendError(resp, "You must fill the type field");
            return;
        }
        if(!access_hash){
            access_hash = 0;
        }
        let tp = PeerType.CHANNEL;
        if(type=="user"){
            tp = PeerType.USER
        }

        if (this.checkPhone(resp, phone, "Session does not exist in getPic")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            let method_:(() => any);
            if(tp==PeerType.CHANNEL){
                method_ = async()=>await caller.getFullChannel(id);
            }else if(tp==PeerType.USER){
                method_ = async()=>await caller.getFullUser(id,access_hash);
            }else{
                method_ = async()=>await caller.getFullUser(id,access_hash);
            }
            const _res = await this.callMethod(method_,resp,phone,caller);

            if(_res && _res._){
                if(tp==PeerType.USER){

                    if(_res._ == "userFull"){
                        if(_res.profile_photo && _res.profile_photo._ == "photo"){
                            const p = _res.profile_photo;
                            const types = [];
                            for(let i=0;i< p.sizes.length;i++){
                                const syze = p.sizes[i];
                                types.push({
                                    width:syze.w,
                                    height:syze.h,
                                    size:syze.size,
                                    volume_id:syze.location.volume_id,
                                    local_id:syze.location.local_id
                                });
                            }

                            resp.send({
                                photo_id: p.access_hash,
                                types
                            });

                        }else{
                            this.sendError(resp,"User does not have any photo")
                        }

                    }else if (_res._ == "error") {
                        this.sendError(resp, _res.text);
                    } else {
                        this.sendError(resp, "Unknown problem in getPictureOfUser:\n" + JSON.stringify(_res));
                    }


                }else if(tp==PeerType.CHANNEL){
                    if(_res._ == "messages.chatFull"){

                        if(_res.full_chat && _res.full_chat.chat_photo && _res.full_chat.chat_photo._ && _res.full_chat.chat_photo._ == "photo"){
                            const p = _res.full_chat.chat_photo;
                            const types = [];
                            for(let i=0;i< p.sizes.length;i++){
                                const syze = p.sizes[i];
                                types.push({
                                    width:syze.w,
                                    height:syze.h,
                                    size:syze.size,
                                    volume_id:syze.location.volume_id,
                                    local_id:syze.location.local_id
                                });
                            }
                            resp.send({
                                photo_id: p.access_hash,
                                types
                            });

                        }else{
                            this.sendError(resp,"Channel does not have any photo")
                        }

                    }else if (_res._ == "error") {
                        this.sendError(resp, _res.text);
                    } else {
                        this.sendError(resp, "Unknown problem in getPictureOfChannel:\n" + JSON.stringify(_res));
                    }
                }
            }else{
                this.sendError(resp,"the body of getPictureOfChannelOrUser is empty");
            }



        }


    }

    public startGettingUpdates = async (req: Request, resp: Response) => {
        const { phone,webhook } = req.body;
        if (!this.hasValue(webhook)) {
            this.sendError(resp, "You must fill the webhook field");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in startGettingUpdates")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const mm = async()=>{
                const u:Update = Update.createInstance(phone, caller);
                u.setUrl(webhook);
                u.start(); 
            };
            mm().then(()=>{});
            resp.send({
                result:"started"
            });
        } 
    }

    public stopGettingUpdates = async (req: Request, resp: Response) => {
        const { phone } = req.body;
        
        if (this.checkPhone(resp, phone, "Session does not exist in stopGettingUpdates")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const method = async()=>{
                const u:Update = Update.createInstance(phone, caller); 
                u.stop();
            }
            resp.send({
                result:"stopped"
            });
            method().then(()=>{});
        } 
    } 
}

export default new ProfileController();