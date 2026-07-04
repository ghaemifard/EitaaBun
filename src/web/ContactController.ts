import type { Request, Response } from 'express';
import Caller from '../MTCaller';
import { generateWebImei, savePath } from '../utils';
import Controller from './Controller';
import SessionManager from './SessionManager';

class ContactController extends Controller{
    public addContact = async (req: Request, resp: Response) => {
        
        let { phone, peerPhone, firstname, lastname } = req.body;
        if(!this.hasValue(peerPhone)){
            this.sendError(resp,"You must state a phone number in peerPhone field");
            return;
        }
        if(!this.hasValue(firstname)){
            firstname = peerPhone;
        }
        if(!this.hasValue(lastname)){
            lastname="";
        }
        if(this.checkPhone(resp,phone,"Session does not exist in addContact")){
            const caller: Caller = SessionManager.getMe().get(phone);
            const importContact = async()=> await caller.importContacts([[peerPhone,firstname,lastname]]);
            const _res = await this.callMethod(importContact,resp,phone,caller);
          
            if(_res && _res._ && _res._=="contacts.importedContacts" && _res.users && _res.users.length>0){
                resp.send({
                    id: _res.users[0].id,
                    acces_hash:_res.users[0].access_hash,
                    status:_res.users[0].status._
                });
            }else{
                this.sendError(resp,`the phone ${peerPhone} is not a member of eitaa`)
            }
        } 

    }
    public deleteContact = async (req: Request, resp: Response) => {
        let { phone, id} = req.body;
        if(!this.hasValue(id)){
            this.sendError(resp,"You must fill the id field");
            return;
        }
        if(this.checkPhone(resp,phone,"Session does not exist in deleteContact")){
            const caller: Caller = SessionManager.getMe().get(phone);
            const deleteContact=async()=>await caller.deleteContacts([id+""]);
            const _res = await this.callMethod(deleteContact,resp,phone,caller);
            if(_res && _res._ && _res._ == "updates" && _res.users && _res.users.length>0){
                resp.send({
                    result:"ok"
                });
            }else{
                this.sendError(resp,"the body of the deleteContact method is empty")
            } 

        }
    }
    public getContacts = async (req: Request, resp: Response) => {
         let {phone} = req.params;
        // let phone = req.query['phone'];
         
        // console.log(`phone: '${phone}'`);
        phone = (phone +"").trim();
        phone = phone.startsWith("+") ? phone : "+"+phone;
        // console.log(`phone: '${phone}'`);
        if(this.checkPhone(resp,phone,"Session does not exist in getContacts")){
            const caller: Caller = SessionManager.getMe().get(phone);
            const getContacts = async()=>await caller.getContacts();
            const _res = await this.callMethod(getContacts,resp,phone,caller);
            // console.log(_res);
            if(_res && _res._ &&  _res.users && _res._ == "contacts.contacts"){
                const ls=[];
                for(let i=0;i<_res.users.length;i++){
                    ls.push({
                        id: _res.users[i].id,
                        phone: _res.users[i].phone,
                        firstname: _res.users[i].first_name,
                        lastname: _res.users[i].last_name,
                        username: _res.users[i].username,
                        access_hash: _res.users[i].access_hash,
                        status: _res.users[i].status._,
                    });
                }
                resp.send({
                    contacts: ls
                });
            }else{
                this.sendError(resp,"respone of getContacts is empty");
            }
        }
    }

}
export default new ContactController()