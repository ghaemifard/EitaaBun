
import Caller from '../MTCaller';
import { generateWebImei, savePath } from '../utils';
import type { Response } from 'express';
import SessionManager from './SessionManager';

export default class Controller {

    protected sendError(resp: Response, text: string) {
        resp.status(400).send({
            msg: text
        });
    }
    protected checkPhone(resp: Response, phone: string, errMsg: string) {
        if (!SessionManager.getMe().contains(phone)) {
            this.sendError(resp, errMsg);
            return false;
        }
        return true;
    }

    protected async refreshToken0(fn: () => any, phone: string, caller: Caller, res: any) {
        if (!res || !res._) {
            throw new Error("Result is empty in refreshToken");
        }
        if (res._ == "eitaaUpdatesExpireToken") {
            const tk = await caller.refreshToken();
            if (tk && tk._ && tk._ == "eitaa_updates_token") {
                caller.setToken(res.token);
                this.saveSession(phone, caller);
                return true;
            } else {
                throw new Error("Result of refreshToken is empty in refreshToken");
            }
        }
        return false;
    }
    protected async callMethod(fn: () => any, resp: Response, phone: string, caller: Caller) {

        let res_ = await fn();

        if (res_ && res_._ && res_._ == "eitaaUpdatesExpireToken") {

            const _res = await caller.refreshToken();
            if (_res && _res._ && _res._ == "eitaa_updates_token") {
                caller.setToken(_res.token);
                this.saveSession(phone, caller);
                res_ = await fn();
            } 
            // else {
            //     this.sendError(resp, "Result of refreshToken is empty in refreshToken");
            // }
        }
        return res_; 
    }
    
    protected async saveSession(phone: string, caller: Caller) {
        // try {
            await Bun.write(savePath + `/${phone.startsWith("+") ? phone.substring(1) : phone}`, `${caller.getImei()} ${caller.getToken()}`)
        // } catch (e) {
        //     throw new Error(`Cannot write the session for ${phone} and token: ${caller.getToken()}`);
        // }
    }
    protected hasValue(field:any){
        return (field) && (field+"").length>0;
    }
}