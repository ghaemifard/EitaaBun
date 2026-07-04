//import tlsLib from 'tls-lib';
//import type { TupleType } from "typescript";
import {request,templateBody} from "./mtproto/connection";
import {TLSerialization } from "./mtproto/tl_utils.js";
import crypto from 'crypto'; 
import fs from 'fs';
import path from 'path'; // اضافه کردن این خط
export default class Caller{
    

    private token = '';
    public setToken(token:string){
        this.token = token;
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
    public async sendMessage(message:string,user_id_:string,access_hash_:string,isMT= false){
        const body = this.createSendMessage(message,user_id_,access_hash_);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }
    private createSendMessage(message:string,user_id_:string,access_hash_:string){
        return {
            name:'messages.sendMessage', 
            params:{
				peer: {
					_: 'inputPeerUser',
					user_id: user_id_,  
					access_hash: access_hash_  
				},
				message,
				flags: '8',  
				entities: [{
					_: 'messageEntityMention', offset: 0, length: message.length,
					user_id: {
						_: 'inputUserEmpty', 
					}
				}],
				random_id: '1659990899450' + Math.floor(Math.random() * 10000)
			}
        }


    }
    /*
    public async importContacts(phones:Array<Array<string>>,isMT= false){
        const body = this.createImportContacts(phones);
        return this.sendRequest(templateBody(body.name,body.params),isMT);
    }

    private createImportContacts(phones:Array<Array<string>>){
        
        return {
            name:'contacts.importContacts', 
            params:{
				contacts: phones.map(p => ({
					_: 'inputPhoneContact',
					phone: p[0],
					first_name: p[1]
				}))
			}
        }
    }
    */
 
 
    // متد دریافت چت‌ها (گروه‌ها)
    public async getDialogs(isMT = false) {
        const body = this.createGetDialogs();
        const response = await this.sendRequest(templateBody(body.name, body.params), isMT);

        // بررسی پاسخ سرور
        if (response && response.dialogs && response.chats) {
            return {
                dialogs: response.dialogs,
                chats: response.chats
            };
        } else {
            console.log('Response structure:', response);
            throw new Error('Invalid response structure');
        }
    }

    private createGetDialogs() {
        return {
            name: 'messages.getDialogs',
            params: {
                flags: 0,
                exclude_pinned: false,
                folder_id: 0,
                offset_date: 0,
                offset_id: 0,
                offset_peer: { _: 'inputPeerEmpty' },
                limit: 100,
                hash: 0
            }
        };
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
    
    
public async signIn(phoneNumber: string, phoneCodeHash: string, phoneCode: string, isMT = false) {
    const body = this.createSignInBody(phoneNumber, phoneCodeHash, phoneCode);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createSignInBody(phoneNumber: string, phoneCodeHash: string, phoneCode: string) {
    return {
        name: 'auth.signIn',
        params: {
            phone_number: phoneNumber,
            phone_code_hash: phoneCodeHash,
            phone_code: phoneCode
        }
    };
}
    
    
    
    
public async sendCode(phoneNumber: string, isMT = false) {
    const body = this.createSendCodeBody(phoneNumber);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createSendCodeBody(phoneNumber: string) {
    return {
        name: 'auth.sendCode',
        params: {
            phone_number: phoneNumber,
            api_id: 'your_api_id',
            api_hash: 'your_api_hash',
            settings: { _: 'codeSettings' }
        }
    };
}
    
    
    
   
public async getPassword(isMT = false) {
    const body = this.createGetPasswordBody();
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetPasswordBody() {
    return {
        name: 'account.getPassword',
        params: {}
    };
}

public async checkPassword(passwordSRP: { srp_id: string, A: string, M1: string }, isMT = false) {
    const body = this.createCheckPasswordBody(passwordSRP);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createCheckPasswordBody(passwordSRP: { srp_id: string, A: string, M1: string }) {
    return {
        name: 'auth.checkPassword',
        params: {
            password: {
                _: 'inputCheckPasswordSRP',
                srp_id: passwordSRP.srp_id,
                A: passwordSRP.A,
                M1: passwordSRP.M1
            }
        }
    };
}

private calculateX(password: string, salt1: Uint8Array, salt2: Uint8Array): string {
    const hash1 = crypto.createHash('sha256').update(Buffer.concat([salt1, Buffer.from(password)])).digest();
    const hash2 = crypto.createHash('sha256').update(Buffer.concat([salt2, hash1])).digest();
    return hash2.toString('hex');
}

private calculateV(g: number, x: string, p: string): string {
    const bigIntG = BigInt(g);
    const bigIntX = BigInt('0x' + x);
    const bigIntP = BigInt('0x' + p);
    const v = bigIntG ** bigIntX % bigIntP;
    return v.toString(16);
}

private calculateK(p: string, g: number): string {
    const hash = crypto.createHash('sha256').update(Buffer.from(p + g.toString())).digest();
    return hash.toString('hex');
}

private calculateU(srp_B: string, v: string): string {
    const hash = crypto.createHash('sha256').update(Buffer.from(srp_B + v)).digest();
    return hash.toString('hex');
}

private calculateA(g: number, x: string, p: string, u: string): string {
    const bigIntG = BigInt(g);
    const bigIntX = BigInt('0x' + x);
    const bigIntP = BigInt('0x' + p);
    const bigIntU = BigInt('0x' + u);
    const A = bigIntG ** (bigIntX + bigIntU) % bigIntP;
    return A.toString(16);
}

private calculateM1(srp_id: string, A: string, srp_B: string, salt1: Uint8Array, salt2: Uint8Array, k: string, v: string, u: string, p: string, g: number): string {
    const hash = crypto.createHash('sha256').update(Buffer.concat([Buffer.from(srp_id), Buffer.from(A), Buffer.from(srp_B), salt1, salt2, Buffer.from(k), Buffer.from(v), Buffer.from(u), Buffer.from(p), Buffer.from(g.toString())])).digest();
    return hash.toString('hex');
}

public async checkPassword2(passwordHash: Uint8Array, phoneCode?: string, phoneNumber?: string, isMT = false) {
    const body = this.createCheckPassword2Body(passwordHash, phoneCode, phoneNumber);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createCheckPassword2Body(passwordHash: Uint8Array, phoneCode?: string, phoneNumber?: string) {
    let flags = 0;
    if (phoneCode) flags |= 1 << 0;
    if (phoneNumber) flags |= 1 << 1;

    return {
        name: 'auth.checkPassword2',
        params: {
            password_hash: passwordHash,
            flags: flags,
            phone_code: phoneCode ? phoneCode : undefined,
            phone_number: phoneNumber ? phoneNumber : undefined
        }
    };
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

    private createWrapUp(tlsBody:TLSerialization){
        return {
            name:"eitaaObject",
            params: {
                token: this.token,
                imei: 'Web_MacOs_Gentoo',
                packed_data: tlsBody.getBytes(true),
                layer: 133
            }
        };
    }







public async getParticipant(channelId: number, accessHash: string, participantId: number, participantAccessHash: string, isMT = false) {
    const body = this.createGetParticipantBody(channelId, accessHash, participantId, participantAccessHash);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetParticipantBody(channelId: number, accessHash: string, participantId: number, participantAccessHash: string) {
    return {
        name: 'channels.getParticipant',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            participant: { _: 'inputPeerUser', user_id: participantId, access_hash: participantAccessHash }
        }
    };
}











public async getGroupAccessHash(groupId: number, isMT = false) {
    const body = this.createGetGroupAccessHashBody(groupId);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetGroupAccessHashBody(groupId: number) {
    return {
        name: 'messages.getFullChat',
        params: {
            chat_id: groupId
        }
    };
}












public async getUserAccessHash(username: string, isMT = false) {
    const body = this.createGetUserAccessHashBody(username);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetUserAccessHashBody(username: string) {
    return {
        name: 'contacts.resolveUsername',
        params: {
            username: username
        }
    };
}





public async getPersonalMessages(peer: any, limit: number = 10, isMT = false) {
    const body = this.createGetPersonalMessagesBody(peer, limit);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetPersonalMessagesBody(peer: any, limit: number) {
    return {
        name: 'messages.getHistory',
        params: {
            peer: peer,
            offset_id: 0,
            offset_date: 0,
            add_offset: 0,
            limit: limit,
            max_id: 0,
            min_id: 0,
            hash: 0
        }
    };
}










public async getGroupMessages(peer: any, limit: number = 10, isMT = false) {
    const body = this.createGetGroupMessagesBody(peer, limit);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetGroupMessagesBody(peer: any, limit: number) {
    return {
        name: 'messages.getHistory',
        params: {
            peer: peer,
            offset_id: 0,
            offset_date: 0,
            add_offset: 0,
            limit: limit,
            max_id: 0,
            min_id: 0,
            hash: 0
        }
    };
}







public async getParticipants(channelId: number, accessHash: string, filter: any, offset: number, limit: number, hash: number, isMT = false) {
    const body = this.createGetParticipantsBody(channelId, accessHash, filter, offset, limit, hash);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetParticipantsBody(channelId: number, accessHash: string, filter: any, offset: number, limit: number, hash: number) {
    return {
        name: 'channels.getParticipants',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            filter: filter,
            offset: offset,
            limit: limit,
            hash: hash
        }
    };
}








public async reportSpam(channelId: number, accessHash: string, userId: number, userAccessHash: string, messageIds: number[], isMT = false) {
    const body = this.createReportSpamBody(channelId, accessHash, userId, userAccessHash, messageIds);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createReportSpamBody(channelId: number, accessHash: string, userId: number, userAccessHash: string, messageIds: number[]) {
    return {
        name: 'channels.reportSpam',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            user_id: { _: 'inputUser', user_id: userId, access_hash: userAccessHash },
            id: messageIds
        }
    };
}











public async deleteUserHistory(channelId: number, accessHash: string, userId: number, userAccessHash: string, isMT = false) {
    const body = this.createDeleteUserHistoryBody(channelId, accessHash, userId, userAccessHash);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createDeleteUserHistoryBody(channelId: number, accessHash: string, userId: number, userAccessHash: string) {
    return {
        name: 'channels.deleteUserHistory',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            user_id: { _: 'inputUser', user_id: userId, access_hash: userAccessHash }
        }
    };
}














public async readHistory(channelId: number, accessHash: string, maxId: number, isMT = false) {
    const body = this.createReadHistoryBody(channelId, accessHash, maxId);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createReadHistoryBody(channelId: number, accessHash: string, maxId: number) {
    return {
        name: 'channels.readHistory',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            max_id: maxId
        }
    };
}








public async createChannel(broadcast: boolean, megagroup: boolean, title: string, about: string, forImport?: boolean, geoPoint?: {lat: number, long: number}, address?: string, isMT = false) {
    const body = this.createChannelBody(broadcast, megagroup, title, about, forImport, geoPoint, address);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createChannelBody(broadcast: boolean, megagroup: boolean, title: string, about: string, forImport?: boolean, geoPoint?: {lat: number, long: number}, address?: string) {
    let flags = 0;
    if (broadcast) flags |= 1 << 0;
    if (megagroup) flags |= 1 << 1;
    if (forImport) flags |= 1 << 3;
    if (geoPoint) flags |= 1 << 2;

    const params = {
        flags,
        title,
        about,
    };

    // if (geoPoint) {
    //     params['geo_point'] = { _: 'inputGeoPoint', lat: geoPoint.lat, long: geoPoint.long };
    // }
    // if (address) {
    //     params['address'] = address;
    // }

    return {
        name: 'channels.createChannel',
        params
    };
}






public async deleteChannel(channelId: number, isMT = false) {
    const body = this.createDeleteChannelBody(channelId);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createDeleteChannelBody(channelId: number) {
    return {
        name: 'channels.deleteChannel',
        params: {
            channel: {
                _: 'inputChannel',
                channel_id: channelId
            }
        }
    };
}







// متد جستجوی کانال‌ها و گروه‌ها
public async getChannels(channelIds: number[], isMT = false) {
    const body = this.createGetChannels(channelIds);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetChannels(channelIds: number[]) {
    return {
        name: 'channels.getChannels',
        params: {
            id: channelIds.map(id => ({ _: 'inputChannel', channel_id: id, access_hash: '' }))
        }
    };
}




public async getFullChannel(channelId: number, isMT = false) {
    const body = this.createGetFullChannel(channelId);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetFullChannel(channelId: number) {
    return {
        name: 'channels.getFullChannel',
        params: {
            channel: {
                _: 'inputChannel',
                channel_id: channelId
            }
        }
    };
}








public async getChannelMessages(channelId: number, accessHash: string, messageIds: Array<number>, isMT = false) {
    const body = this.createGetChannelMessagesBody(channelId, accessHash, messageIds);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetChannelMessagesBody(channelId: number, accessHash: string, messageIds: Array<number>) {
    return {
        name: 'channels.getMessages',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            id: messageIds.map(id => ({ _: 'inputMessageID', id: id }))
        }
    };
}






public async deleteChannelMessages(channelId: number, messageIds: Array<number>, isMT = false) {
    const body = this.createDeleteChannelMessages(channelId, messageIds);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createDeleteChannelMessages(channelId: number, messageIds: Array<number>) {
    return {
        name: 'channels.deleteMessages',
        params: {
            channel: {
                _: 'inputChannel',
                channel_id: channelId
            },
            id: messageIds // این باید به صورت Vector<int> ارسال شود، اطمینان حاصل کنید که ساختار مناسبی در بدنه ارسالی است.
        }
    };
}

















public async editChannelTitle(channelId: number, newTitle: string, isMT = false) {
    const body = this.createEditChannelTitleBody(channelId, newTitle);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createEditChannelTitleBody(channelId: number, newTitle: string) {
    return {
        name: 'channels.editTitle',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId },
            title: newTitle
        }
    };
}














public async checkChannelUsername(channelId: number, username: string, isMT = false) {
    const body = this.createCheckChannelUsernameBody(channelId, username);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createCheckChannelUsernameBody(channelId: number, username: string) {
    return {
        name: 'channels.checkUsername',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId },
            username: username
        }
    };
}












public async updateChannelUsername(channelId: number, username: string, isMT = false) {
    const body = this.createUpdateChannelUsernameBody(channelId, username);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createUpdateChannelUsernameBody(channelId: number, username: string) {
    return {
        name: 'channels.updateUsername',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId },
            username: username
        }
    };
}











public async joinChannel(channelId: number, isMT = false) {
    const body = this.createJoinChannelBody(channelId);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createJoinChannelBody(channelId: number) {
    return {
        name: 'channels.joinChannel',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId }
        }
    };
}













public async leaveChannel(channelId: number, isMT = false) {
    const body = this.createLeaveChannelBody(channelId);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createLeaveChannelBody(channelId: number) {
    return {
        name: 'channels.leaveChannel',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId }
        }
    };
}










public async inviteUsersToChannel(channelId: number, userIds: Array<number>, isMT = false) {
    const body = this.createInviteUsersToChannelBody(channelId, userIds);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createInviteUsersToChannelBody(channelId: number, userIds: Array<number>) {
    return {
        name: 'channels.inviteToChannel',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId },
            users: userIds.map(id => ({ _: 'inputUser', user_id: id }))
        }
    };
}



 
public async editChatPhoto(chatId:number, file: { id: number, parts: number, name: string }, isMT = false) {
    console.log("---------------------------------");
    const body = this.createEditChatPhoto(chatId,file);
    return this.sendRequestUpload(templateBody(body.name, body.params), isMT);
}

private createEditChatPhoto(chatId:number, file: { id: number, parts: number, name: string }){
    return {
        name:"messages.editChatPhoto",
        params:{
            chat_id: chatId,
            // photo:{
            //     _:"inputChatPhotoEmpty",
            // }

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

public async uploadPhoto(filePath: string) {
    const file = fs.readFileSync(filePath);
    //"9804807875334955"
    const fileId = Math.floor(Math.random() * 1e16); // شناسه یکتا برای فایل
    const partSize = 512 * 1024; // 512KB
    const parts = Math.ceil(file.length / partSize);

    for (let i = 0; i < parts; i++) {
        const part = file.slice(i * partSize, (i + 1) * partSize);
        const uarr = new Uint8Array(part);
        // console.log(part);
        const body = this.createUploadFilePart(fileId, i, uarr);
        const res = await this.sendRequestUpload(templateBody(body.name, body.params));
        console.log("==============================");
        console.log(res);
    }

        // const part = await Bun.file(filePath).arrayBuffer();
        // console.log(part);

        // const body = this.createUploadFilePart(fileId, 0, part);
        // const res = await this.sendRequestUpload(templateBody(body.name, body.params));
        // console.log("==============================");
        // console.log(res);

    return {
        id: fileId,
        parts: parts,
        name: "photo.jpeg"
    };
}

private createUploadFilePart(fileId: number, partIndex: number, part: Uint8Array) {
    return {
        name: 'upload.saveFilePart',
        params: {
            file_id: fileId,
            file_part: partIndex,
            bytes: part,
            file_total_parts: 1,
            peer: {
                _: "peerChat",
                chat_id: 54068831
            },
            totalFileSize: 9771,
            flags: 3
        }
    };
}

// متد ارسال عکس به گروه
public async sendPhotoToGroup(channelId: number, accessHash: string, file: { id: number, parts: number, name: string }, isMT = false) {
    console.log("---------------------------------");
    const body = this.createSendPhotoToGroup(channelId, accessHash, file);
    return this.sendRequestUpload(templateBody(body.name, body.params), isMT);
}

private createSendPhotoToGroup(channelId: number, accessHash: string, file: { id: number, parts: number, name: string }) {
   console.log(">>>>>>>>>>>>>>");
   console.log(file);
   console.log("<<<<<<<<<<<<<<");
    return {
        name: 'messages.sendMedia',
        params: {
            peer: { _: 'inputPeerChat', chat_id: channelId },
            media: {
                _: 'inputMediaUploadedPhoto',
                flags: 0,
                
                file: {
                    _: 'inputFile',
                    id: file.id,
                    parts: file.parts,
                    name: "photo.jpeg",
                    md5_checksum: ""
                }
            },
            message: '',
            flags: 136, 
            clear_draft: true,
            entities: [],
            random_id: Math.floor(Math.random() * 1e16)
        }
    };
}







public async saveBigFilePart(fileId: number, filePart: number, fileTotalParts: number, bytes: Uint8Array, peer?: any, totalFileSize?: number, isMT = false) {
    const body = this.createSaveBigFilePart(fileId, filePart, fileTotalParts, bytes, peer, totalFileSize);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createSaveBigFilePart(fileId: number, filePart: number, fileTotalParts: number, bytes: Uint8Array, peer?: any, totalFileSize?: number) {
    let flags = 0;
    if (peer) flags |= 1 << 0;
    if (totalFileSize) flags |= 1 << 1;

    return {
        name: 'upload.saveBigFilePart',
        params: {
            file_id: fileId,
            file_part: filePart,
            file_total_parts: fileTotalParts,
            bytes: bytes,
            flags: flags,
            peer: peer ? { _: 'Peer', ...peer } : undefined,
            totalFileSize: totalFileSize ? totalFileSize : undefined
        }
    };
}





















    public async editChannelPhoto(channelId: number, accessHash: string, photoFileId: string, isMT = false) {
        const body = this.createEditChannelPhoto(channelId, accessHash, photoFileId);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createEditChannelPhoto(channelId: number, accessHash: string, photoFileId: string) {
        return {
            name: 'channels.editPhoto',
            params: {
                channel: {
                    _: 'inputChannel',
                    channel_id: channelId,
                    access_hash: accessHash
                },
                photo: {
                    _: 'inputChatUploadedPhoto',
                    file: {
                        _: 'inputFile',
                        id: photoFileId,
                        parts: 1,
                        name: 'photo.jpg'
                    }
                }
            }
        };
    }










 














public async editChannelBanned(channelId: number, accessHash: string, userId: number, userAccessHash: string, bannedRights: any, isMT = false) {
    console.log("Channel ID:", channelId);
    console.log("User ID:", userId);
    console.log("Banned Rights:", bannedRights);

    const body = this.createEditChannelBannedBody(channelId, accessHash, userId, userAccessHash, bannedRights);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createEditChannelBannedBody(channelId: number, accessHash: string, userId: number, userAccessHash: string, bannedRights: any) {
    return {
        name: 'channels.editBanned',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            participant: { _: 'inputPeerUser', user_id: userId, access_hash: userAccessHash },
            banned_rights: bannedRights
        }
    };
}











public async inviteToChannel(channelId: number, accessHash: string, userIds: number[], userAccessHashes: string[], isMT = false) {
    console.log("Channel ID:", channelId);
    console.log("User IDs:", userIds);
    console.log("User Access Hashes:", userAccessHashes);

    const body = this.createInviteToChannelBody(channelId, accessHash, userIds, userAccessHashes);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createInviteToChannelBody(channelId: number, accessHash: string, userIds: number[], userAccessHashes: string[]) {
    const users = userIds.map((userId, index) => ({
        _: 'inputUser',
        user_id: userId,
        access_hash: userAccessHashes[index]
    }));

    return {
        name: 'channels.inviteToChannelLayer84',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            users: users
        }
    };
}












 
 






public async exportMessageLink(channelId: number, accessHash: string, messageId: number, grouped: boolean = false, thread: boolean = false, isMT = false) {
    const body = this.createExportMessageLinkBody(channelId, accessHash, messageId, grouped, thread);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createExportMessageLinkBody(channelId: number, accessHash: string, messageId: number, grouped: boolean, thread: boolean) {
    let flags = 0;
    if (grouped) flags |= 1 << 0;
    if (thread) flags |= 1 << 1;

    return {
        name: 'channels.exportMessageLink',
        params: {
            flags: flags,
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            id: messageId
        }
    };
}
















public async toggleSignatures(channelId: number, accessHash: string, enabled: boolean, isMT = false) {
    const body = this.createToggleSignaturesBody(channelId, accessHash, enabled);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createToggleSignaturesBody(channelId: number, accessHash: string, enabled: boolean) {
    return {
        name: 'channels.toggleSignatures',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            enabled: enabled
        }
    };
}














public async getAdminedPublicChannels(byLocation: boolean = false, checkLimit: boolean = false, isMT = false) {
    const body = this.createGetAdminedPublicChannelsBody(byLocation, checkLimit);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetAdminedPublicChannelsBody(byLocation: boolean, checkLimit: boolean) {
    let flags = 0;
    if (byLocation) flags |= 1 << 0;
    if (checkLimit) flags |= 1 << 1;

    return {
        name: 'channels.getAdminedPublicChannels',
        params: {
            flags: flags
        }
    };
}








public async getAdminLog(channelId: number, accessHash: string, query: string = "", eventsFilter: any = null, admins: any[] = [], maxId: number = 0, minId: number = 0, limit: number = 100, isMT = false) {
    const body = this.createGetAdminLogBody(channelId, accessHash, query, eventsFilter, admins, maxId, minId, limit);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetAdminLogBody(channelId: number, accessHash: string, query: string, eventsFilter: any, admins: any[], maxId: number, minId: number, limit: number) {
    let flags = 0;
    if (eventsFilter) flags |= 1 << 0;
    if (admins.length > 0) flags |= 1 << 1;

    return {
        name: 'channels.getAdminLog',
        params: {
            flags: flags,
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            q: query,
            events_filter: eventsFilter,
            admins: admins.map(admin => ({ _: 'inputUser', user_id: admin.user_id, access_hash: admin.access_hash })),
            max_id: maxId,
            min_id: minId,
            limit: limit
        }
    };
}













public async readMessageContents(channelId: number, accessHash: string, messageIds: number[], isMT = false) {
    const body = this.createReadMessageContentsBody(channelId, accessHash, messageIds);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createReadMessageContentsBody(channelId: number, accessHash: string, messageIds: number[]) {
    return {
        name: 'channels.readMessageContents',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            id: messageIds
        }
    };
}


















public async deleteHistory(channelId: number, accessHash: string, maxId: number, isMT = false) {
    const body = this.createDeleteHistoryBody(channelId, accessHash, maxId);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createDeleteHistoryBody(channelId: number, accessHash: string, maxId: number) {
    return {
        name: 'channels.deleteHistory',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            max_id: maxId
        }
    };
}

















public async togglePreHistoryHidden(channelId: number, accessHash: string, enabled: boolean, isMT = false) {
    const body = this.createTogglePreHistoryHiddenBody(channelId, accessHash, enabled);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createTogglePreHistoryHiddenBody(channelId: number, accessHash: string, enabled: boolean) {
    return {
        name: 'channels.togglePreHistoryHidden',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            enabled: enabled
        }
    };
}

















public async getLeftChannels(offset: number, isMT = false) {
    const body = this.createGetLeftChannelsBody(offset);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetLeftChannelsBody(offset: number) {
    return {
        name: 'channels.getLeftChannels',
        params: {
            offset: offset
        }
    };
}


















public async getGroupsForDiscussion(isMT = false) {
    const body = this.createGetGroupsForDiscussionBody();
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetGroupsForDiscussionBody() {
    return {
        name: 'channels.getGroupsForDiscussion',
        params: {}
    };
}










public async setDiscussionGroup(broadcastChannelId: number, broadcastAccessHash: string, groupChannelId: number, groupAccessHash: string, isMT = false) {
    const body = this.createSetDiscussionGroupBody(broadcastChannelId, broadcastAccessHash, groupChannelId, groupAccessHash);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createSetDiscussionGroupBody(broadcastChannelId: number, broadcastAccessHash: string, groupChannelId: number, groupAccessHash: string) {
    return {
        name: 'channels.setDiscussionGroup',
        params: {
            broadcast: { _: 'inputChannel', channel_id: broadcastChannelId, access_hash: broadcastAccessHash },
            group: { _: 'inputChannel', channel_id: groupChannelId, access_hash: groupAccessHash }
        }
    };
}












public async editCreator(channelId: number, accessHash: string, userId: number, userAccessHash: string, password: any, isMT = false) {
    const body = this.createEditCreatorBody(channelId, accessHash, userId, userAccessHash, password);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createEditCreatorBody(channelId: number, accessHash: string, userId: number, userAccessHash: string, password: any) {
    return {
        name: 'channels.editCreator',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            user_id: { _: 'inputUser', user_id: userId, access_hash: userAccessHash },
            password: password
        }
    };
}

















public async editLocation(channelId: number, accessHash: string, geoPoint: any, address: string, isMT = false) {
    const body = this.createEditLocationBody(channelId, accessHash, geoPoint, address);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createEditLocationBody(channelId: number, accessHash: string, geoPoint: any, address: string) {
    return {
        name: 'channels.editLocation',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            geo_point: geoPoint,
            address: address
        }
    };
}

















public async toggleSlowMode(channelId: number, accessHash: string, seconds: number, isMT = false) {
    const body = this.createToggleSlowModeBody(channelId, accessHash, seconds);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createToggleSlowModeBody(channelId: number, accessHash: string, seconds: number) {
    return {
        name: 'channels.toggleSlowMode',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            seconds: seconds
        }
    };
}












public async getInactiveChannels(isMT = false) {
    const body = this.createGetInactiveChannelsBody();
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetInactiveChannelsBody() {
    return {
        name: 'channels.getInactiveChannels',
        params: {}
    };
}











public async convertToGigagroup(channelId: number, accessHash: string, isMT = false) {
    const body = this.createConvertToGigagroupBody(channelId, accessHash);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createConvertToGigagroupBody(channelId: number, accessHash: string) {
    return {
        name: 'channels.convertToGigagroup',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash }
        }
    };
}












public async viewSponsoredMessage(channelId: number, accessHash: string, randomId: Uint8Array, isMT = false) {
    const body = this.createViewSponsoredMessageBody(channelId, accessHash, randomId);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createViewSponsoredMessageBody(channelId: number, accessHash: string, randomId: Uint8Array) {
    return {
        name: 'channels.viewSponsoredMessage',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            random_id: randomId
        }
    };
}





public async getLatestMessage(channelId: number, accessHash: string, isMT = false) {
    const body = this.createGetLatestMessageBody(channelId, accessHash);
    const response = await this.sendRequest(templateBody(body.name, body.params), isMT);
    if (response.messages && response.messages.length > 0) {
        return response.messages[response.messages.length - 1]; // آخرین پیام در لیست
    } else {
        throw new Error("No messages found in the channel.");
    }
}

private createGetLatestMessageBody(channelId: number, accessHash: string) {
    return {
        name: 'channels.getMessages',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash },
            id: []
        }
    };
}






public async editMessage(peer: any, messageId: number, newMessage: string, noWebpage: boolean = false, media: any = null, replyMarkup: any = null, entities: any[] = [], scheduleDate: number = 0, isMT = false) {
    const body = this.createEditMessageBody(peer, messageId, newMessage, noWebpage, media, replyMarkup, entities, scheduleDate);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createEditMessageBody(peer: any, messageId: number, newMessage: string, noWebpage: boolean, media: any, replyMarkup: any, entities: any[], scheduleDate: number) {
    let flags = 0;
    if (noWebpage) flags |= 1 << 1;
    if (newMessage) flags |= 1 << 11;
    if (media) flags |= 1 << 14;
    if (replyMarkup) flags |= 1 << 2;
    if (entities.length > 0) flags |= 1 << 3;
    if (scheduleDate) flags |= 1 << 15;

    return {
        name: 'messages.editMessage',
        params: {
            flags: flags,
            peer: peer,
            id: messageId,
            message: newMessage ? newMessage : undefined,
            media: media ? media : undefined,
            reply_markup: replyMarkup ? replyMarkup : undefined,
            entities: entities.length > 0 ? entities : undefined,
            schedule_date: scheduleDate ? scheduleDate : undefined
        }
    };
}







public async getSponsoredMessages(channelId: number, accessHash: string, isMT = false) {
    const body = this.createGetSponsoredMessagesBody(channelId, accessHash);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createGetSponsoredMessagesBody(channelId: number, accessHash: string) {
    return {
        name: 'channels.getSponsoredMessages',
        params: {
            channel: { _: 'inputChannel', channel_id: channelId, access_hash: accessHash }
        }
    };
}









    private createImportContacts(contacts: Array<{ phone: string, firstName: string, lastName: string }>) {
        const inputContacts = contacts.map(contact => ({
            _: 'inputPhoneContact',
            client_id: Math.floor(Math.random() * 1e6),  // Unique identifier for each contact
            phone: contact.phone,
            first_name: contact.firstName,
            last_name: contact.lastName
        }));

        return {
            name: 'contacts.importContacts',
            params: {
                contacts: inputContacts
            }
        };
    }

    public async importContacts(contacts: Array<{ phone: string, firstName: string, lastName: string }>, isMT = false) {
        const body = this.createImportContacts(contacts);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }













    private createAddContact(contact: { phone: string, firstName: string, lastName: string }) {
        return {
            name: 'contacts.addContact',
            params: {
                flags: 0,
                add_phone_privacy_exception: true,
                id: {
                    _: 'inputUser',
                    user_id: Math.floor(Math.random() * 1e6),  // باید به جای آن شناسه واقعی کاربر استفاده شود
                    access_hash: Math.floor(Math.random() * 1e6) // باید به جای آن هش واقعی دسترسی استفاده شود
                },
                first_name: contact.firstName,
                last_name: contact.lastName,
                phone: contact.phone
            }
        };
    }

    public async addContact(contact: { phone: string, firstName: string, lastName: string }) {
        const body = this.createAddContact(contact);
        return this.sendRequest(templateBody(body.name, body.params));
    }

 
    // متد حذف مخاطبین
    public async deleteContacts(userIds: Array<number>, isMT = false) {
        const body = this.createDeleteContacts(userIds);
        return this.sendRequest(templateBody(body.name, body.params), isMT);
    }

    private createDeleteContacts(userIds: Array<number>) {
        return {
            name: 'contacts.deleteContacts',
            params: {
                id: userIds.map(id => ({
                    _: 'inputUser',
                    user_id: id,
                    access_hash: ''
                }))
            }
        };
    }

















// متد جستجوی گروه
public async searchContacts(query: string, limit: number = 10, isMT = false) {
    const body = this.createSearchContacts(query, limit);
    return this.sendRequest(templateBody(body.name, body.params), isMT);
}

private createSearchContacts(query: string, limit: number) {
    return {
        name: 'contacts.search',
        params: {
            q: query,
            limit: limit
        }
    };
}







}