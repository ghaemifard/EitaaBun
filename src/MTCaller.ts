
import type { TupleType } from "typescript";
import {request,requestD,templateBody} from "./mtproto/connection";
import {TLSerialization } from "./mtproto/tl_utils.js";
import {PeerType} from "./utils"
import fs from 'fs';
import path from 'path';

export default class Caller{
    
    
    private token = '';
    public setToken(token:string){
        this.token = token;
    }
    public getToken(){
        return this.token;
    }
    public getImei(){
        return this.imei;
    }

    public generateOneDigit(){
        let res= Math.floor(Math.random()*10);
        res = res == 10 ? res-1 : res;
        return res;
    }
    public generateWebImei(){
        const small_letters = "abcdefghijlkmnopqrstuvwxyzabcdefghijlkmnopqrstuvwxyz";
        let result = '';
        for(var i=0;i<8;i++){
            result += small_letters[Math.floor(Math.random()*(small_letters.length-1))];
        }
        for(var i=0;i<3;i++){
            result += this.generateOneDigit();
        }
        result += small_letters[Math.floor(Math.random()*(small_letters.length-1))] +
        small_letters[Math.floor(Math.random()*(small_letters.length-1))];

        result += this.generateOneDigit();;
        result += small_letters[Math.floor(Math.random()*(small_letters.length-1))];
        result += "__web";
        return result;
    }
    private imei= '';
    public setImei(imei:string){
        this.imei = imei;
    }








    // public async getUsers(users:Array<string>,isMT= false){
    //     const body = this.createGetUsers(users);
         
    //     return this.sendRequest(templateBody(body.name,body.params),isMT);
    // }

    // private createGetUsers(users:Array<string>){
    //     return {
    //         name:'users.getUsers', 
    //         params:{
	// 			id: users.map(id => ({
	// 				_: 'inputUser',
	// 				user_id: id
	// 			}))
	// 		}
    //     }
    // }

    // {
    //     "pts": 708,
    //     "date": 1719208709,
    //     "qts": -1,
    //     "flags": 0
    // }

    // {
    //     "channel": {
    //         "_": "inputChannel",
    //         "channel_id": 54552169,
    //         "access_hash": 1718158144
    //     },
    //     "filter": {
    //         "_": "channelMessagesFilterEmpty"
    //     },
    //     "pts": 50,
    //     "limit": 30,
    //     "flags": 0
    // }


    // {
    //     "channel": {
    //         "_": "inputChannel",
    //         "channel_id": 54735817,
    //         "access_hash": 868811587
    //     },
    //     "filter": {
    //         "_": "channelMessagesFilterEmpty"
    //     },
    //     "pts": 19,
    //     "limit": 30,
    //     "flags": 0
    // }


    public signUp(phone:string,code:string,name:string,code_hash="",isMT = false){
        const body = this.createSignUp(phone,code,name,code_hash);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createSignUp(phone:string,code:string,name:string,code_hash=""){
        return{
            name:"auth.signUp",
            params:{
                phone_number:phone,
                phone_code_hash:code_hash,
                phone_code:code,
                first_name:name,
                last_name:"",
                app_info:{
                    _:"eitaaAppInfo",
                    build_version:2496,
                    device_model: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0",
                    system_version: "MacIntel",
                    app_version: "4.6.9 K",
                    lang_code: "en-US",
                    sign: ""
                }
            }
        }
    }

    
     
    public getDialogFilters(isMT = false){
        const body = this.createGetDoalogFilters();
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createGetDoalogFilters(){
        return{
            name:"messages.getDialogFilters",
            params:{

            }
        }
    }
    public getTopPeers(isMT = false){
        const body = this.creategetToPeers();
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    private creategetToPeers(){
        return{
            name:"contacts.getTopPeers",
            params:{
                correspondents: true,
                offset: 0,
                limit: 15,
                hash: "0",
                flags: 1
            }
        }
    }
    public search(isMT = false){
        const body = this.createSearchVideo();
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createSearchCounter(){
        return{
            name:"messages.getSearchCounters",
            params:{ 
                    peer: {
                        _: "inputPeerUser",
                        user_id: 3298427,
                        access_hash: 603798544
                    },
                    filters: [
                        {
                            _: "inputMessagesFilterPhotoVideo"
                        },
                        {
                            _: "inputMessagesFilterDocument"
                        },
                        {
                        _: "inputMessagesFilterUrl"
                        },
                        {
                        _: "inputMessagesFilterMusic"
                        },
                        {
                            _: "inputMessagesFilterRoundVoice"
                        }
                    ]
                }
            }
        
    }
    private createSearchVideo(){
        return {
            name:"messages.search",
            params:{
                peer: {
                    _: "inputPeerUser",
                    user_id: 3298427,
                    access_hash: 603798544
                },
                q: "",
                filter: {
                _: "inputMessagesFilterDocument"
                },
                min_date: 0,
                max_date: 0,
                limit: 4,
                offset_id: 0,
                add_offset: 0,
                max_id: 0,
                min_id: 0,
                hash: "",
                top_msg_id: 0,
                flags: 2
            }
        }
    }
    public getProfilePhoto(photo:string,local:number,volume:number,id:number,type:PeerType,accesHash=0,offset=0,isMT = false){
        const body = this.createGetProfilePhoto(photo,local,volume,id,type,accesHash,offset);
        return this.sendRequestDoownload(templateBody(body.name, body.params), isMT);
    }
    private createGetProfilePhoto(photo:string,local:number,volume:number,id:number,type:PeerType,accesHash=0,offset=0){
        let peer;
        switch(type){
            case PeerType.CHAT:
                peer = { _: 'inputPeerChat', chat_id: id };
                break;
            case PeerType.USER:
                peer = { _: 'inputPeerUser', user_id: id, access_hash: accesHash  };
                break;
            case PeerType.CHANNEL:
                peer = { _: 'inputPeerChannel', channel_id: id };
                break; 
        }
        return{
            name:"upload.getFile",
            params:{
                location:{
                    _:"inputPeerPhotoFileLocation",
                    pFlags:{},
                    photo_id:photo,
                    local_id:local,
                    volume_id:volume,
                    flags:0,
                    peer
                },
                offset,
                limit:524288,
                flags:0
            }
        }
    }
    public getPhoto(refrence:Array<number>,id:number,accessHash:string,offset=0,isMT = false){
        const body = this.createGetPhoto(refrence,id,accessHash,offset);
        return this.sendRequestDoownload(templateBody(body.name, body.params), isMT);
    }
    private createGetPhoto(reference:Array<number>,id:number,access_hash:string,offset=0){
        return {
            name:"upload.getFile",
            params:{
                offset,
                limit:524288,
                flags:0,
                
                location:{
                    _:"inputPhotoFileLocation",
                    thumb_size:"m",
                    checkedReference:true,
                    id,
                    access_hash,
                    file_reference:reference
                }
            }
        }
    }

    public getDocumentFile(refrence:Array<number>,id:string,accessHash:string,offset=0,isMT = false){
        const body = this.createGetDocumentFile(refrence,id,accessHash,offset);
        return this.sendRequestDoownload(templateBody(body.name, body.params), isMT);
    }

    private createGetDocumentFile(refrence:Array<number>,id:string,accessHash:string,offset=0){
        return{
            name:"upload.getFile",
            params:{
                offset,
                limit:524288,
               // flags:0,
                location:{
                    _:"inputDocumentFileLocation",
                    id,
                    access_hash:accessHash,
                    checkedReference:true,
                    file_reference: refrence
                }
            }
        }
    }


    public getChannelMessages(id:number,ids:Array<number>,isMT = false){
        const body = this.createGetChannelMessages(id,ids);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createGetChannelMessages(id:number,ids:Array<number>){
        let dIds =new Array<any>();
        for(let i=0;i<ids.length;i++){
            dIds.push({
                _:"inputMessageID",
                id: ids[i]
            });
        }

        return{
            name:"channels.getMessages",
            params:{
                channel:{
                    _:"inputChannel",
                    channel_id:id,
                    access_hash: 0
                },
                id: dIds
            }
        }
    }

    
    public getMessages(ids:Array<number>,isMT = false){
        const body = this.createGetMessages(ids);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    private createGetMessages(ids:Array<number>){
        let dIds =new Array<any>();
        for(let i=0;i<ids.length;i++){
            dIds.push({
                _:"inputMessageID",
                id: ids[i]
            });
        }

        return{
            name:"messages.getMessages",
            params:{
                id: dIds
            }
        }
    }



    public getChannelDifference(channel_id:number,pts=0, limit=30,flags=0,isMT = false){
        const body = this.createGetChannelDifference(channel_id,pts,limit,flags);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    private createGetChannelDifference(channel_id:number,pts=0, limit=30,flags=0){
        return {
            name:"updates.getChannelDifference",
            params:{
                channel:{
                    _:"inputChannel",
                    channel_id,
                    access_hash: 0
                },
                filter:{
                    _:"channelMessagesFilterEmpty"
                },
                pts,
                limit,
                flags
            }
        }
    }

    public getDifference(pts=0,date=0,qts=-1,flags=0,isMT = false){
        const body = this.createGetDifference(pts,date,qts,flags);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createGetDifference(pts=0,date=0,qts=-1,flags=0){
        if(date<1){
            date= Math.floor(Date.now()/1000);
        }
        return{
            name:"updates.getDifference",
            params:{
                pts,
                date,
                qts,
                flags
            }
        }
    }

    public checkPassword2(password_hash:Uint8Array,phone_code:string,phone:string,isMT = false) {
        const body = this.createCheckPassword2(password_hash,phone_code,phone);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createCheckPassword2(password_hash:Uint8Array,phone_code:string,phone:string){
        return{
            name:"auth.checkPassword2",
            params:{
                flags:3,
                phone_number:phone,
                phone_code,
                password_hash
            }
        }
    }

    public getPasswordLayer68(isMT = false) {
        const body = this.createGetPasswordLayer68();
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createGetPasswordLayer68(){
        return{
            name:"account.getPasswordLayer68",
            params:{
                flags:0
            }
        }
    }

    public getPasswordSettingsLayer68(password_hash:Uint8Array|null=null,isMT = false) {
        const body = this.createGetPasswordSettingsLayer68();
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createGetPasswordSettingsLayer68(password_hash:Uint8Array|null=null){
        return{
            name:"account.getPasswordSettings68",
            params:{ 
                    password_hash: [
                        151,
                        8,
                        117,
                        135,
                        83,
                        75,
                        116,
                        238,
                        185,
                        222,
                        132,
                        86,
                        63,
                        87,
                        131,
                        200,
                        53,
                        253,
                        134,
                        95,
                        156,
                        89,
                        190,
                        7,
                        7,
                        41,
                        36,
                        143,
                        128,
                        146,
                        126,
                        108
                    ] 
            }
        }
    }


    public updatePasswordSettingsLayer68(new_salt:Uint8Array,new_password_hash:Uint8Array,hint="123123",current_password_hash:Uint8Array|null=null,isMT = false) {
        const body = this.createUpdatePasswordSettingsLayer68(new_salt,new_password_hash,hint,current_password_hash);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }


    private createUpdatePasswordSettingsLayer68(new_salt:Uint8Array,new_password_hash:Uint8Array,hint="123123",current_password_hash:Uint8Array|null=null){
        if(!current_password_hash){
            current_password_hash = new Uint8Array([]);
        }
        let array = new Array<number>();
        for(let i=0;i<new_salt.length;i++){
            array.push(new_salt[i]);
        }
        if(new_salt.length==32){
            for(let i=0;i<8;i++){
                array.push(0);
            }
            // const second = new Uint8Array([0,0,0,0 ,0,0,0,0]);
            // const res = new  Uint8Array(new_salt.length+second.length);
            // res.set(new_salt);
            // res.set(second,new_salt.length);
            // new_salt = res;
            
        }
        let pass = new Array<number>();
        for(let i=0;i<new_password_hash.length;i++){
            pass.push(new_password_hash[i]);
        }
        
        // const data = {flags:1,new_salt:array};
        // console.log(`new salt: ${data.new_salt}`);
        // return null;
        // hint=''
        // pass = new Array<number>();
        // array = new Array<number>();

        return{
            name:"account.updatePasswordSettingsLayer68",
            params:{
                current_password_hash,
                new_settings: {
                    _: "account.passwordInputSettingsLayer68",
                    flags: 3,
                    hint,
                    email: "ghaemifard@aut.ac.ir",
                    new_salt:array,
                    new_password_hash:pass
                }
            }
        }
    }

    // public updatePasswordSettingsLayer68(isMT = false) {
    //     const body = this.createUpdatePasswordSettingsLayer68();
    //     return this.sendRequest(templateBody(body.name, body.params), isMT);
    // }

    
    private createUpdatePasswordSettingsLayer68_(){
        return{
            name:"account.updatePasswordSettingsLayer68",
            params:{
                current_password_hash:[ 142, 205, 63, 168, 190, 24, 238, 118, 3, 67, 186, 164, 234, 208, 154, 178, 230, 246, 68, 120, 136, 21, 19, 142, 209, 27, 174, 201, 15, 114, 102, 131 ],
                new_settings: {
                    _: "account.passwordInputSettingsLayer68",
                    flags: 1,
                    hint: "123123",
                    new_salt: [
                        50,
                        101,
                        51,
                        48,
                        100,
                        102,
                        57,
                        56,
                        51,
                        52,
                        101,
                        53,
                        50,
                        54,
                        99,
                        49,
                        53,
                        48,
                        50,
                        102,
                        50,
                        50,
                        51,
                        51,
                        53,
                        56,
                        48,
                        102,
                        53,
                        100,
                        100,
                        49,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    new_password_hash: [
                        142,
                        205,
                        63,
                        168,
                        190,
                        24,
                        238,
                        118,
                        3,
                        67,
                        186,
                        164,
                        234,
                        208,
                        154,
                        178,
                        230,
                        246,
                        68,
                        120,
                        136,
                        21,
                        19,
                        142,
                        209,
                        27,
                        174,
                        201,
                        15,
                        114,
                        102,
                        131
                    ]
                }
            }
        }
    }


    public verifyTwoStepVerificationCode(phone_code_hash:string,phone_code:string,isMT = false) {
        const body = this.createVerifyTwoStepVerificationCode(phone_code_hash,phone_code);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    
    private createVerifyTwoStepVerificationCode(phone_code_hash:string,phone_code:string){
        return{
            name:"verifyTwoStepVerificationCode",
            params:{
                phone_code_hash,
                phone_code
            }
        }
    }
    public sendTwoStepVerificationCode(isMT = false) {
        const body = this.createSendTwoStepVerificationCode();
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    
    private createSendTwoStepVerificationCode(){
        return{
            name:"sendTwoStepVerificationCode",
            params:{}
        }
    }

    public setPrivacy(isMT = false) {
        const body = this.createSetPrivacy();
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createSetPrivacy(){
        return{
            name:"account.setPrivacy",
            params:{
                key: {
                    _: "inputPrivacyKeyChatInvite"
                },
                rules: [
                    {
                        _: "inputPrivacyValueDisallowAll"
                    }
                ]
            }
        }
    }

    public async updateUsername( username:string, isMT = false) {
        const body = this.createUpdateUsername(username);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createUpdateUsername(username:string){
        return{
            name:"account.updateUsername",
            params:{
                username
            }
        }
    }

    public async checkUsername( username:string, isMT = false) {
        const body = this.createCheckUsername(username);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createCheckUsername(username:string){
        return{
            name:"account.checkUsername",
            params:{
                username
            }
        }
    }

    public getAuthorizations(isMT = false) {
        const body = this.createGetAuthorizations();
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createGetAuthorizations(){
        return{
            name:"account.getAuthorizations",
            params:{

            }
        }
    }

    public async editChatAbout(channelId:number, about:string, isMT = false) {
        const body = this.createEditChatAbout(channelId,about);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createEditChatAbout(channelId:number,about:string){
        return{
            name:"messages.editChatAbout",
            params:{
                peer: {
                    _: "inputPeerChannel",
                    channel_id: channelId,
                    access_hash: 0
                },
                about
            }
        }
    }

    public async updateChannelUsername(channelId:number, username:string, isMT = false) {
        const body = this.createUpdateChannelusername(channelId,username);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    private createUpdateChannelusername(channelId:number,username:string){
        return{
            name:"channels.updateUsername",
            params:{
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: 0
                }, 
                username
            }
        }
    }

    

    public async checkChannelUsername(channelId:number, username:string, isMT = false) {
        const body = this.createCheckChannelusername(channelId,username);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    private createCheckChannelusername(channelId:number,username:string){
        return{
            name:"channels.checkUsername",
            params:{
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: 0
                }, 
                username
            }
        }
    }

    
    public async exportMessageLink(channelId:number, id:number, isMT = false) {
        const body = this.createExportmessageLink(channelId,id);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createExportmessageLink(channelId:number,id:number){
        return{
            name:"channels.exportMessageLink",
            params:{
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: 0
                },
                id:id,
                flags:0
            }
        }
    }

    public async deleteChannel(channelId:number, isMT = false) {
        const body = this.createDeleteChannel(channelId);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    private createDeleteChannel(channelId:number){
        return{
            name:"channels.deleteChannel",
            params:{
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: 0
                }
            }
        }
    }

    public async updatePinnedMessage(type:PeerType,msgId:number,id:number,access_hash_=0,pin=true , isMT = false) {
        const body = this.createUpdatePinnedMessage(type,msgId,id,access_hash_,pin);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    private createUpdatePinnedMessage(type:PeerType,msgId:number,id:number,access_hash_=0,pin=true){
        let peer;
        switch(type){
            case PeerType.CHAT:
                peer = { _: 'inputPeerChat', chat_id: id };
                break;
            case PeerType.USER:
                peer = { _: 'inputPeerUser', user_id: id, access_hash: access_hash_  };
                break;
            case PeerType.CHANNEL:
                peer = { _: 'inputPeerChannel', channel_id: id };
                break; 
        }
        let flags=0
        if(!pin){
            flags = 2
        }
        return{
            name:"messages.updatePinnedMessage",
            params:{
                peer,
                id:msgId,
                flags 
            }
        }
    }


    public async getChannelParticipants(channelId:number,accesHash=0 ,isAdminFilter = false,offset=0,size=200, isMT = false) {
        const body = this.createGetChannelParticipants(channelId,accesHash,isAdminFilter,offset,size);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createGetChannelParticipants(channelId:number,accesHash=0,isAdminFilter=false,offset=0,size=200){
        return{
            name:"channels.getParticipants",
            params:{
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: accesHash
                },
                filter:{
                    _: (isAdminFilter) ? 'channelParticipantsAdmins' : 'channelParticipantsRecent'
                },
                offset: offset,
                limit: size,
                hash:0
            }
        }
    }

    public async readChannelHistory( maxMsgId:number,channelId:number,accesHash=0 , isMT = false) {
        const body = this.createReadHistory(maxMsgId,channelId,accesHash);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createReadHistory(maxMsgId:number,channelId:number,accesHash=0){
        return{
            name:"channels.readHistory",
            params:{
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: accesHash
                },
                max_id: maxMsgId
            }
        }
    }

    public async readMessageHistory( maxMsgId:number,uid:number,accesHash=0 , isMT = false) {
        const body = this.createMessageReadHistory(maxMsgId,uid,accesHash);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createMessageReadHistory(maxMsgId:number,uid:number,accesHash=0){
        return{
            name:"channels.readHistory",
            params:{
                channel: { _: 'inputPeerUser', user_id: uid, access_hash: accesHash  },

                max_id: maxMsgId
            }
        }
    }

    public async uploadProfilePhoto( file: { id: number, parts: number, name: string } , isMT = false) {
        const body = this.createUploadProfilePhoto(file);
        return this.sendRequestUpload(templateBody(body.name, body.params), isMT);
    }

    private createUploadProfilePhoto(file: { id: number, parts: number, name: string }){
        return{
            name:"photos.uploadProfilePhoto",
            params:{
                flags:1,
                file: {
                    _: "inputFile",
                    id: file.id,
                    parts: file.parts,
                    name: file.name,
                    md5_checksum: ""
                }
            }
        }
    }
    public async joinChannel( channelId:number,accesHash=0, isMT = false) {
        const body = this.createJoinChannel(channelId,accesHash);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createJoinChannel(channelId:number,accesHash=0){
        return{
            name:"channels.joinChannel",
            params:{
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: accesHash
                }
            }
        }
    }

    public async updateProfile( firstName:string|null,lastName:string|null,about_:string|null, isMT = false) {
        const body = this.createUpdateProfile(firstName,lastName,about_);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }
    private createUpdateProfile(firstName:string|null,lastName:string|null,about_:string|null){
        let flags=0;
        if(firstName){
            flags |= 1<<0;
        }
        if(lastName){
            flags |= 1<<1;
        }
        if(about_){
            flags |= 1<<2;
        }
        return{
            name:"account.updateProfile",
            params:{
                flags,
                first_name:firstName,
                last_name:lastName,
                about:about_
            }
        }
    }

    public async editChannelPhoto(channelId:number, file: { id: number, parts: number, name: string } | null, isMT = false) {
        
        const body = this.createChannelEditPhoto(channelId,file);
        return this.sendRequestUpload(templateBody(body.name, body.params), isMT);
    }

    private createChannelEditPhoto(channelId:number, file: { id: number, parts: number, name: string } | null){
        if(!file){
            return{
                name:"channels.editPhoto",
                params:{
                    channel: {
                        _: 'inputChannel',
                        channel_id: channelId,
                        access_hash: 0
                    }, 
                    photo:{
                        _:"inputChatPhotoEmpty",
                    } 
            }
            }
        }
        return{
            name:"channels.editPhoto",
            params:{
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: 0
                }, 
                photo: {
                    _: "inputChatUploadedPhoto",
                    file: {
                        _: "inputFile",
                        id: file.id,
                        parts: file.parts,
                        name: file.name,
                        md5_checksum: ""
                    },
                    flags: 1
                }
            }
        }
    }

    public async editChatPhoto(chatId:number, file: { id: number, parts: number, name: string } | null, isMT = false) {
        
        const body = this.createEditChatPhoto(chatId,file);
        return this.sendRequestUpload(templateBody(body.name, body.params), isMT);
    }

    private createEditChatPhoto(chatId:number, file: { id: number, parts: number, name: string } | null){
        if(!file){
            return {
                name:"messages.editChatPhoto",
                params:{
                    chat_id: chatId,
                    photo:{
                        _:"inputChatPhotoEmpty",
                    } 
                }
            }
        }
        return {
            name:"messages.editChatPhoto",
            params:{
                chat_id: chatId, 
                photo: {
                    _: "inputChatUploadedPhoto",
                    file: {
                        _: "inputFile",
                        id: file.id,
                        parts: file.parts,
                        name: file.name,
                        md5_checksum: ""
                    },
                    flags: 1
                }
            }
        }
    }

    public async sendFile(id: number ,accessHash:number,peerType:PeerType, file: { id: number, parts: number, name: string },message="", isMT = false) {
        const body = this.createSendMediaAsFile(id,accessHash, peerType, file,message);
        return this.sendRequestUpload(templateBody(body.name, body.params), isMT);
    }

    private createSendMediaAsFile(id:number,access_hash_:number,peerType:PeerType,file: { id: number, parts: number, name: string },message=""){
        let peer;
        switch(peerType){
            case PeerType.CHAT:
                peer = { _: 'inputPeerChat', chat_id: id };
                break;
            case PeerType.USER:
                peer = { _: 'inputPeerUser', user_id: id, access_hash: access_hash_  };
                break;
            case PeerType.CHANNEL:
                peer = { _: 'inputPeerChannel', channel_id: id };
                break; 
        }

        return{
            name: 'messages.sendMedia',
            params: {
                peer: peer,
                media: {
                    _: 'inputMediaUploadedDocument',
                    flags: 16,
                    pFlags: {
                        force_file: true
                    },
                    mime_type: "text/plain",
                    attributes: [
                        {
                            _: "documentAttributeFilename",
                            file_name: file.name
                        }
                    ],
                    file: {
                        _: 'inputFile',
                        id: file.id,
                        parts: file.parts,
                        name: file.name,
                        md5_checksum: ""
                    }
                },
                message,
                flags: 136, 
                clear_draft: true,
                entities: [],
                random_id: Math.floor(Math.random() * 1e16)
            }
        }
    } 

    public async sendPhoto(id: number ,accessHash:number,peerType:PeerType, file: { id: number, parts: number, name: string },message="", isMT = false) {
         
        const body = this.createSendMediaAsPhoto(id,accessHash, peerType, file,message);
        return this.sendRequestUpload(templateBody(body.name, body.params), isMT);

    }



    private createSendMediaAsPhoto(id:number,access_hash_:number,peerType:PeerType,file: { id: number, parts: number, name: string },message=""){
        let peer;
        switch(peerType){
            case PeerType.CHAT:
                peer = { _: 'inputPeerChat', chat_id: id };
                break;
            case PeerType.USER:
                peer = { _: 'inputPeerUser', user_id: id, access_hash: access_hash_  };
                break;
            case PeerType.CHANNEL:
                peer = { _: 'inputPeerChannel', channel_id: id };
                break; 
        }

        return{
            name: 'messages.sendMedia',
            params: {
                peer: peer,
                media: {
                    _: 'inputMediaUploadedPhoto',
                    flags: 0,
                    
                    file: {
                        _: 'inputFile',
                        id: file.id,
                        parts: file.parts,
                        name: file.name,
                        md5_checksum: ""
                    }
                },
                message,
                flags: 136, 
                clear_draft: true,
                entities: [],
                random_id: Math.floor(Math.random() * 1e16)
            }
        }
    } 

    public async uploadFile(filePath: string,peerType:PeerType|null,id=0) {
        const file = fs.readFileSync(filePath);
        
        const fileId = Math.floor(Math.random() * 1e16); 
        const partSize = 20 * 1024; // 512KB
        const parts = Math.ceil(file.length / partSize);
    
        for (let i = 0; i < parts; i++) {
            const part = file.slice(i * partSize, (i + 1) * partSize);
            const uarr = new Uint8Array(part);
            // console.log(part);
            const body = this.createSaveFilePart(fileId, i, uarr,parts,file.length,peerType,id);
            const res = await this.sendRequestUpload(templateBody(body.name, body.params));
             
        }
      
        return {
            id: fileId,
            parts: parts,
            name: path.basename(filePath)
        };
    }

    private createSaveFilePart(fileId: number, part: number, bytes: Uint8Array,totalParts:number,size:number,type:PeerType|null,id:number) {
        let peer = null;
        let flags = 2;
        if(type!=null){
            flags=3;
            switch(type){
                case PeerType.CHANNEL:
                    peer={_: "peerChannel",channel_id: id};
                    break;
                case PeerType.CHAT:
                    peer={_: "peerChat",chat_id: id};
                    break;
                case PeerType.USER:
                    peer={_: "peerUser",user_id: id};
                    break;
            }

        }
        
        return {
            name: 'upload.saveFilePart',
            params: {
                file_id: fileId,
                file_part: part,
                bytes: bytes,
                file_total_parts: totalParts,
                peer:peer,
                totalFileSize: size,
                flags
            }
        };
    }
    
    
    
    public async leaveChannel(channelId:number,isMT= false){
        const body = this.createLeaveChannel(channelId);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private  createLeaveChannel(channelId:number){
        return {
            name:"channels.leaveChannel",
            params:{
                channel:{
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: 0
                }
            }
        }
    }

    public async editChannelTitle(channelId:number,newTitle:string,isMT= false){
        const body = this.createEditTitle(channelId,newTitle);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createEditTitle(channelId:number,newTitle:string){
        return {
            name:"channels.editTitle",
            params:{
                channel:{
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: 0
                },
                title:newTitle
            }
        }
    }

    public async editDefaultBanned(id:number,sendMessage:boolean,sendMedia:boolean,sendGif:boolean,sendForwards:boolean,sendLinks:boolean,viewUsers:boolean,addusers:boolean,isMT= false){
        const body = this.createEditChatDefaultBannedRights(id,sendMessage,sendMedia,sendGif,sendForwards,sendLinks,viewUsers,addusers);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    
    private createEditChatDefaultBannedRights(id:number,sendMessage:boolean,sendMedia:boolean,sendGif:boolean,sendForwards:boolean,sendLinks:boolean,viewUsers:boolean,addusers:boolean){
        let flags = 47134
        // console.log("sendForwards: " + sendForwards);
        // console.log("sendMessage: " + sendMessage);

        if(!sendMessage){
            sendMedia = sendForwards = sendGif = sendLinks = sendMessage;
        }else if(!sendMedia){
            sendGif = sendMedia;
        }
        // console.log("sendForwards: " + sendForwards);
        // console.log("sendMessage: " + sendMessage);
        let allAttrs: { [key: string]: any } ={
            send_messages:true,
            send_forwarded_messages:true,
            send_media:true,
            send_stickers:true,
            send_gifs:true,
            embed_links:true,
            view_participants:true,
            invite_users:true
        }
        if(sendMessage){
            delete allAttrs.send_messages;
            flags &=  0xfffd
        }
        if(sendMedia){
            delete allAttrs.send_media;
            flags &= 0xfffb;
        }
        if(sendGif){
            delete allAttrs.send_stickers;
            delete allAttrs.send_gifs;
            flags &= 0xfff7;
            flags &= 0xff1f;
        }
        if(sendForwards){
            delete allAttrs.send_forwarded_messages;
            flags &= 0xf7ff;
            // console.log("Executed");
        }
        if(sendLinks){
            delete allAttrs.embed_links;
            flags &= 0xefff;
        }
        if(viewUsers){
            delete allAttrs.view_participants;
            flags &= 0xdfff;
        }
        if(addusers){
            delete allAttrs.invite_users;
            flags &= 0x7fff;
        }
 
 
        return {
            name:"messages.editChatDefaultBannedRights",
            params:{
                peer:{ _: 'inputPeerChannel', channel_id: id, access_hash: 0 },
                banned_rights:{
                    _:"chatBannedRights",
                    until_date:2147483647,
                    pFlags:allAttrs,
                    flags
                }
            }
        };

        // console.log(res);
        // return res;
    }

    private createEditChatDefaultBannedRights_0(id:number,sendMessage:boolean,sendMedia:boolean,sendGif:boolean,sendForwards:boolean,sendLinks:boolean,viewUsers:boolean,addusers:boolean){
        let flags = 0
        if(!sendMessage){
            flags |= 1<<0;
            flags |= 1<<1;
        }
        if(!sendMedia){
            flags |= 1<<2;
        }
        if(!sendGif){
            flags |= 1<<3;
        }
        if(!sendForwards){
            flags |= 1<<10;
            flags |= 1<<11;
        }
        if(!sendLinks){
            flags |= 1<<12;
            flags |= 1<<13;
        }
        if(viewUsers){
            flags |= 1<<13;
            flags |= 1<<14;
        }
        if(!addusers){
            flags |= 1<<15;
        }
 
        return{
            name:"messages.editChatDefaultBannedRights",
            params:{
                peer:{ _: 'inputPeerChannel', channel_id: id, access_hash: 0 },
                banned_rights:{
                    _:"chatBannedRights",
                    until_date:0,
                    flags
                }
            }
        }
    }

    public async editBanned(id:number,userId:number,access_hash:number,sendMessage:boolean,sendMedia:boolean,sendGif:boolean,sendForwards:boolean,sendLinks:boolean,viewUsers:boolean,addusers:boolean,leave=false,isMT= false){
        if(leave){ 
            const body = this.createEditBanned2(id,userId,access_hash);
            return this.sendRequest(templateBody(body.name,body.params),isMT);
        }
        const body = this.createEditBanned(id,userId,access_hash,sendMessage,sendMedia,sendGif,sendForwards,sendLinks,viewUsers,addusers);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createEditBanned2(id:number,userId:number,access_hash:number ){
        return{
            name:"channels.editBanned",
            params:{
                channel:{
                    _: 'inputChannel',
                    channel_id: id,
                    access_hash: 0
                },
                participant:{ 
                    _: "inputPeerUser",
                    user_id: userId,
                    access_hash: access_hash
                },
                banned_rights:{
                    _:"chatBannedRights",
                    until_date:0,
                    pFlags:{
                        view_messages:true
                    },
                    flags:1
                }
            }
        }

    }
    private createEditBanned(id:number,userId:number,access_hash:number,sendMessage:boolean,sendMedia:boolean,sendGif:boolean,sendForwards:boolean,sendLinks:boolean,viewUsers:boolean,addusers:boolean){
        let flags = 47134
        if(!sendMessage){
            sendMedia = sendForwards = sendGif = sendLinks = sendMessage;
        }else if(!sendMedia){
            sendGif = sendMedia;
        }
        let allAttrs: { [key: string]: any } ={
            send_messages:true,
            send_forwarded_messages:true,
            send_media:true,
            send_stickers:true,
            send_gifs:true,
            embed_links:true,
            view_participants:true,
            invite_users:true
        }
        if(sendMessage){
            delete allAttrs.send_messages;
            flags &=  0xfffd
        }
        if(sendMedia){
            delete allAttrs.send_media;
            flags &= 0xfffb;
        }
        if(sendGif){
            delete allAttrs.send_stickers;
            delete allAttrs.send_gifs;
            flags &= 0xfff7;
            flags &= 0xff1f;
        }
        if(sendForwards){
            delete allAttrs.send_forwarded_messages;
            flags &= 0xf7ff;
        }
        if(sendLinks){
            delete allAttrs.embed_links;
            flags &= 0xefff;
        }
        if(viewUsers){
            delete allAttrs.view_participants;
            flags &= 0xdfff;
        }
        if(addusers){
            delete allAttrs.invite_users;
            flags &= 0x7fff;
        }


        
        return{
            name:"channels.editBanned",
            params:{
                channel:{
                    _: 'inputChannel',
                    channel_id: id,
                    access_hash: 0
                },
                participant:{ 
                    _: "inputPeerUser",
                    user_id: userId,
                    access_hash: access_hash
                },
                banned_rights:{
                    _:"chatBannedRights",
                    until_date:2147483647,
                    pFlags:allAttrs,
                    flags
                }
            }
        }
    }

    private createEditBanned_0(id:number,userId:number,access_hash:number,sendMessage:boolean,sendMedia:boolean,sendGif:boolean,sendForwards:boolean,sendLinks:boolean,viewUsers:boolean,addusers:boolean){
        let flags = 0
        if(!sendMessage){
            flags |= 1<<0;
            flags |= 1<<1;
        }
        if(!sendMedia){
            flags |= 1<<2;
        }
        if(!sendGif){
            flags |= 1<<3;
        }
        if(!sendForwards){
            flags |= 1<<10;
            flags |= 1<<11;
        }
        if(!sendLinks){
            flags |= 1<<12;
            flags |= 1<<13;
        }
        if(viewUsers){
            flags |= 1<<13;
            flags |= 1<<14;
        }
        if(!addusers){
            flags |= 1<<15;
        }
 
        console.log("flags: " + flags);
        
        return{
            name:"channels.editBanned",
            params:{
                channel:{
                    _: 'inputChannel',
                    channel_id: id,
                    access_hash: 0
                },
                participant:{ 
                    _: "inputPeerUser",
                    user_id: userId,
                    access_hash: access_hash
                },
                banned_rights:{
                    _:"chatBannedRights",
                    until_date: 2147483647,
                    flags
                }
            }
        }
    }


    public async editAdmin(id:number,userId:number,access_hash:number,changeInfo:boolean,banUsers:boolean,deleteMessages:boolean,inviteUsers:boolean,pinMessages:boolean,addAdmins:boolean,sendLives:boolean,isMT= false){
        const body = this.createEditAdmin(id,userId,access_hash,changeInfo,banUsers,deleteMessages,inviteUsers,pinMessages,addAdmins,sendLives);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createEditAdmin(id:number,userId:number,access_hash:number,changeInfo:boolean,banUsers:boolean,deleteMessages:boolean,inviteUsers:boolean,pinMessages:boolean,addAdmins:boolean,sendLives:boolean){
        let flags=0;
        if(changeInfo){
            flags |= 1<<0;
        }
        if(banUsers){
            flags |= 1<<4;
        }
        if(deleteMessages){
            flags |= 1<<3;
        }
        if(inviteUsers){
            flags |= 1<<5;
        }
        if(pinMessages){
            flags |= 1<<7;
        }
        if(addAdmins){
            flags |= 1<<9;
        }
        if(sendLives){
            flags |= 1<<20;
        }
         
        return{
            name:"channels.editAdmin",
            params:{
                channel:{
                    _: 'inputChannel',
                    channel_id: id,
                    access_hash: 0
                },
                user_id:{ 
                    _: "inputUser",
                    user_id: userId,
                    access_hash: access_hash
                },
                admin_rights:{
                    _:"chatAdminRights",
                    flags
                    // change_info:true,
                    // post_messages:true,
                    // edit_messages:true,
                    // delete_messages:true,
                    // ban_users:false,
                    // pin_messages:true,
                    // add_admins:true,
                    // anonymous:false,
                    // other:false
                },
                rank:""
            }
        }
    }

    public async inviteToChannel(channelId:number,channelHash:string,ids:Array<Array<string>>,isMT= false){
        const body = this.createInviteToChannel(channelId,channelHash,ids);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createInviteToChannel(channelId:number,channelHash:string,ids:Array<Array<string>>){
        return{
            name:"channels.inviteToChannel",
            params:{
                channel:{
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: channelHash
                },
                users: ids.map(u=>({ 
                    _: "inputUser",
                    user_id: u[0],
                    access_hash: u[1]
                }))

            }
        }
    }

    public async migrateChat(chatId:number,isMT= false){
        const body = this.createMigrateChat(chatId);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createMigrateChat(chatId:number){
        return{
            name:"messages.migrateChat",
            params:{
                chat_id: chatId
            }
        }
    }

    public async addChatUser(chatId:number,userId:number,accessHash:string,isMT= false){
        const body = this.createAddChatUser(chatId,userId,accessHash);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }

    private createAddChatUser(chatId:number,userId:number,accessHash:string){
        return{
            name:"messages.addChatUser",
            params:{
                chat_id: chatId,
                fwd_limit:10,
                user_id:{
                    _: 'inputUser',
                    user_id: userId
                    //access_hash: accessHash
                }

            }
        }
    }

    public async editCreator(channelId:number,userId:number,accesHash:string,isMT= false){
        const body = this.createEditCreator(channelId,userId,accesHash);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createEditCreator(channelId:number,userId:number,accesHash:string){
        return{
            name: 'channels.editCreator',
            params: {
            channel: {
                _: 'inputChannel',
                channel_id: channelId,
                access_hash: "-1008532674" 
            },
            user_id: {
                _: 'inputUser',
                user_id: userId,
                access_hash: accesHash
            },
            password: {
                _: 'inputCheckPasswordEmpty' 
            }
        }
    };
         
    }
    public async deleteAccount(isMT= false){
        const body = this.createDeleteAccount();
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createDeleteAccount(){
        return{
            name:"account.deleteAccount",
            params:{
                reason:"No Reason"
            }
        }
    }



    public async getPassword(isMT= false){
        const body = this.createGetPassword();
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createGetPassword(){
        return{
            name:"account.getPassword",
            params:{ 
            }
        }
    }


    public async getState(isMT= false){
        const body = this.createGetState();
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createGetState(){
        return{
            name:'updates.getState', 
            params:{ 
				
			}
        }
    }
    public async getFullChat(chatId:string,isMT= false){
        const body = this.createGetFullChat(chatId);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }

    private createGetFullChat(chatId:string){
        return {
            name:'messages.getFullChat', 
            params:{
				chat_id: chatId
			}
        }
    }
    public async getFullChannel(channelId:number,isMT= false){
        const body = this.createGetFullChannel(channelId);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createGetFullChannel(channelId:number){
        return {
            name:'channels.getFullChannel', 
            params:{
				channel: {
					_: 'inputChannel',
					channel_id: channelId,
                    access_hash: 0
				}
			}
        }
    }
    public async getFullUser(userId:string|null,access_hash_:string|null,isMT= false){
        const body = this.createGetFullUser(userId,access_hash_);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
   private createGetFullUser(userId:string|null,access_hash_:string|null){
    if(!userId){
        return{
            name:'users.getFullUser', 
            params:{
				id: {
					_: 'inputUserSelf'
				}
			}
        }
    }    
    return{ 
            name:'users.getFullUser', 
            params:{
				id: {
					_: 'inputUser',
					user_id: userId,
					access_hash: access_hash_
				}
			}
        }
   }
 

public async deleteChannelMessage(msgIds:Array<number>,id:number,isMT= false){
    const body = this.createDeleteChannelMessage(msgIds,id);
    return this.sendRequest(templateBody(body.name,body.params),isMT);
}

private createDeleteChannelMessage(msgIds:Array<number>,id:number){
     
    return {
        name:'channels.deleteMessages',
        params:{ 
            id: msgIds, 
            channel:{
                _:"inputChannel",
                channel_id: id,
                access_hash:0
            } 
        }
    }
}
public async deleteMessage(msgIds:Array<number>,revoke_=true,isMT= false){
    const body = this.createDeleteMessage(msgIds,revoke_);
    return this.sendRequest(templateBody(body.name,body.params),isMT);
}

private createDeleteMessage(msgIds:Array<number>,revoke_=true){
    let flags=0
    if(revoke_) flags =1;
    return {
        name:'messages.deleteMessages',
        params:{ 
            id: msgIds,
            revoke: revoke_,
            flags 
        }
    }
}

    public async editMessage(message:string,user_id_:number,access_hash_:number,msgId:number,type=PeerType.USER,isMT= false){
        const body = this.createEditMessage(message,user_id_,access_hash_,msgId,type);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createEditMessage(message:string,user_id_:number,access_hash_:number,msgId:number,type=PeerType.USER){
        
        return {
            name:'messages.editMessage', 
            params:{
				flags:2048,
				peer: (type == PeerType.USER) ? {
					_: 'inputPeerUser',
					user_id: user_id_, 
					access_hash: access_hash_  
				} : {
					_: 'inputPeerChannel',
					channel_id: user_id_, 
					access_hash: access_hash_  
				} ,
				id: msgId,
				message 
			}
        }
    }
    
    public async forwardMessages(msgIds:Array<number>,from_id:number,from_type:PeerType,to_id:number,to_type:PeerType,from_access_hash_=0,to_access_hash=0,drop_author=false,isMT= false){
        const body = this.createForwardMessages(msgIds,from_id,from_type,to_id,to_type,from_access_hash_,to_access_hash,drop_author);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createForwardMessages(msgIds:Array<number>,from_id:number,from_type:PeerType,to_id:number,to_type:PeerType,from_access_hash_=0,to_access_hash=0,drop_author=false){
        let from_peer;
		let to_peer;

		switch (from_type) {
			case PeerType.CHAT:
				from_peer = { _: 'inputPeerChat', chat_id: from_id }
				break;
			case PeerType.CHANNEL:
				from_peer = { _: 'inputPeerChannel', channel_id: from_id, access_hash: from_access_hash_ }
				break;
			case PeerType.USER:
				from_peer = { _: 'inputPeerUser', user_id: from_id, access_hash: from_access_hash_ }
		}
		switch (to_type) {
			case PeerType.CHAT:
				to_peer = { _: 'inputPeerChat', chat_id: to_id }
				break;
			case PeerType.CHANNEL:
				to_peer = { _: 'inputPeerChannel', channel_id: to_id, access_hash: to_access_hash }
				break;
			case PeerType.USER:
				to_peer = { _: 'inputPeerUser', user_id: to_id, access_hash: to_access_hash }
		}

        return {
            name:'messages.forwardMessages', 
            params:{
				flags:(drop_author) ? 2048 : 0,
				from_peer,
				to_peer,
				id: msgIds,
				random_id:msgIds.map(a=>
					Math.floor(Math.random() * 1e16)
				)
				
			}
        }
    }
    public async createGroup(title_:string, userIds:Array<string>,isMT= false){
        const body = this.createCreateChat(title_, userIds);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createCreateChat(title_:string, userIds:Array<string>){
        return{
            name:'messages.createChat', 
            params:{
				users: userIds.map(id => ({
					_: 'inputUser',
					user_id: id
				})),
				title:title_
				
			}
        }
    }


    public async createChannel(title_:string,about_:string,megaGroup=true,isMT= false){
        const body = this.createCreateChannel(title_,about_,megaGroup);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createCreateChannel(title_:string,about_:string,megaGroup=true){
        let flags =0;
		if(megaGroup){
			flags=2;
		}
        return {
            name:'channels.createChannel', 
            params:{
                flags,
				title:title_,
				about:about_,
				megagroup:megaGroup
			}
        };
    }
    public async getHistory(id:number,type=PeerType.USER,msg_id=0,addOffset=0,limit_=1000,isMT= false){
        const body = this.createGetHistory(id,type,msg_id,addOffset,limit_);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createGetHistory(id:number,type=PeerType.USER,msg_id=0,addOffset=0,limit_=10){
        let peer;
        switch (type) {
                case PeerType.CHAT:
                    peer = { _: 'inputPeerChat', chat_id: id };
                break;
                case PeerType.USER:
                    peer = { _: 'inputPeerUser', user_id: id };
                break;
                case PeerType.CHANNEL:
                    peer = { _: 'inputPeerChannel', channel_id: id };
                break;    
        
            default:
                peer = { _: 'inputPeerUser', user_id: id };
                break;
        }

        return {
            name:'messages.getHistory', 
            params:{
				peer, 
				offset_id: msg_id,
				offset_date: 0,
				add_offset: addOffset,
				limit: limit_,
				max_id: 0,
				min_id: 0,
				hash: 0
			}
        }
    }
    public async refreshToken(isMT= false){
        const body = this.createRefreshToken();
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createRefreshToken(){
        return {
            name:'eitaaRefreshToken', 
            params:{
				app_info: {
					_: 'eitaaAppInfo',
					build_version: 'MacIntel',
					device_model: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0",
					system_version: 'MacIntel',
					app_version: '4.6.2 K',
					lang_code: 'fa',
					sign: '',
				}
			}
        }
    }
    public async deleteContacts(userIds:Array<string>,isMT= false){
        const body = this.createDeleteContacts(userIds);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createDeleteContacts(userIds:Array<string>){
        return {
            name:'contacts.deleteContacts', 
            params:{
				id: userIds.map(id => ({
					_: 'inputUser',
					user_id: id
				}))
			}
        }
    }
    public async resolveUsername(username:string,isMT= false){
        const body = this.createResolveUsername(username);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createResolveUsername(username:string){
        return {
            name:'contacts.resolveUsername',
            params: { username }
        }
    }
    public async sendMessage(message:string,user_id_:string,access_hash_="0",type=PeerType.USER,replyId=0,isMT= false){
        const body = this.createSendMessage(message,user_id_,access_hash_,type,replyId);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createSendMessage(message:string,user_id_:string,access_hash_="0",type=PeerType.USER,replyId=0){
        let peer;
		switch (type) {
			case PeerType.CHAT:
				peer = { _: 'inputPeerChat', chat_id: user_id_ }
				break;
			case PeerType.CHANNEL:
				peer = { _: 'inputPeerChannel', channel_id: user_id_, access_hash: access_hash_ }
				break;
			case PeerType.USER:
				peer = { _: 'inputPeerUser', user_id: user_id_, access_hash: access_hash_ }
		}
        let flags =0;
        if(replyId>0) flags=1; 
        return {
            name:'messages.sendMessage', 
            params:{
				peer,
				message,
				flags,  
				reply_to_msg_id: replyId,  
				random_id: 4259990899450 + Math.floor(Math.random() * 10000)
			}
        } 
    }
    
    public async importContacts(phones:Array<Array<string>>,isMT= false){
        
        const body = this.createImportContacts(phones);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }

    private createImportContacts(phones:Array<Array<string>>){
        const one = phones[0];
        let firstName ="";
        let lastName ="";
        let phone= one[0];
        phone = `${phone.substring(0,3)} ${phone.substring(3,6)} ${phone.substring(6,9)} ${phone.substring(9)}`
        console.log(`The Phone: '${phone}'`);
        if(one.length==1){
            firstName = phone; 
        }else if(one.length == 2){
            firstName = one[1]; 
        }else if(one.length==3){
            firstName = one[1];
            lastName = one[2];
        }
        return {
            name:'contacts.importContacts', 
            params:{
				contacts: phones.map(p => ({
					_: 'inputPhoneContact',
                    client_id: "0",
					phone: p[0],
					first_name: firstName,
                    last_name: lastName
				}))
			}
        }
    }
    public async getDialogs(offsetId=0,size=100,theDate=0,isMT= false){
        const body = this.createGetDialogs(offsetId,size,theDate);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createGetDialogs(offsetId=0,size=100,theDate=0){
        return {
            name:'messages.getDialogs', 
            params:{
				pFlags: {},
				flags: 0, 
                folder_id:0,
				offset_date: theDate,
				offset_id: offsetId,
				offset_peer: { _: 'inputPeerEmpty' },
				limit: size,
				hash: '0',
			}
        }
    }
    public async getContacts(isMT= false){
        const body = this.createGetContacts();
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createGetContacts(){
        return {
            name:'contacts.getContacts',
			params:{}
        }
    }
    public async login(phoneNumber:string,code:string,isMT= false){
        const body = this.createLogin(phoneNumber,code);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createLogin(phoneNumber:string,code:string){
        return{
            name:'auth.signIn', 
            params: {
				phone_number: phoneNumber,
				phone_code: code,
				
			}
        }
    }

    public async cancelCode(phoneNumber:string,isMT= false){
        const body = this.createCancelCode(phoneNumber);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }

    private createCancelCode(phoneNumber:string){
        return{
            name:"auth.cancelCode",
            params:{
                phone_number: phoneNumber
            }
        }
    }

    public async resendCode(phoneNumber:string,isMT= false){
        const body = this.createResendCode(phoneNumber);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }

    private createResendCode(phoneNumber:string){
        return{
            name:"auth.resendCode",
            params:{
                phone_number: phoneNumber
            }
        }
    }
    public async sendCode(phoneNumber:string,isMT= false){
        const body = this.createSendCode(phoneNumber);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }

    private createSendCode(phoneNumber:string){
        return {
            name:'auth.sendCode', 
            params:{
				phone_number: phoneNumber,
				api_id: 1025907,
				api_hash: '452b0359b988148995f22ff0f4229750',  
				settings: { flags: 0,
                     _: 'codeSettings' ,
                     device_model: 'Web', // 'Android' برای دستگاه‌های اندروید
                     system_version: 'Chrome', // 'Android 10' برای دستگاه‌های اندروید
                     app_version: '6.4.14',
                     lang_code: 'fa',
                    }
			}
        }
    }
    public async sendLogout(isMT= false){
        const body = this.createLogout();
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }

    private createLogout(){
        return {
            name:"auth.logOut",
            params: { 
            }
        }
    }

    private async sendRequest(tlsBody:TLSerialization, isMT= false, isVector=false){
        const res = this.createWrapUp(tlsBody);
        return request(templateBody(res.name,res.params,isMT) ,isVector);
    }
    private async sendRequestUpload(tlsBody:TLSerialization, isMT= false, isVector=false){
        const res = this.createWrapUp(tlsBody);
        return request(templateBody(res.name,res.params,isMT),true ,isVector);
    }
    private async sendRequestDoownload(tlsBody:TLSerialization, isMT= false, isVector=false){
        const res = this.createWrapUp(tlsBody);
        return requestD(templateBody(res.name,res.params,isMT),true ,isVector);
    }

    private createWrapUp(tlsBody:TLSerialization){
        return {
            name:"eitaaObject",
            params: {
                token: this.token,
                // imei: 'Web_MacOs_Gentoo',
                // imei: "lvnjlviv239ra9v__web",
                imei: this.imei,
                packed_data: tlsBody.getBytes(true),
                layer: 133,
                flags:32
            }
        };
    }


}